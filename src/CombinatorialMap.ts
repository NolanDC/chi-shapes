import { Vector } from './vector';


export interface Triangle {
  a: number;
  b: number;
  c: number;
}

export interface Dart {
  index: number;
  origin: number;
  face: number;
  next: number;
  removed?: boolean;
}

export class CombinatorialMap {
  points: Vector[]
  darts: Dart[] = [];
  theta0: Map<Dart, Dart> = new Map();
  theta1: Map<Dart, Dart> = new Map();
  dartMap: Map<string, Dart> = new Map();
  vertexDarts: Map<number, Dart[]> = new Map();


  constructor(triangles: Triangle[], points: Vector[]) {
    this.points = points
    if (triangles && triangles.length > 0 && points && points.length > 0) {
      this.buildFromTriangles(triangles, points);
    }
  }

  private buildFromTriangles(triangles: Triangle[], points: Vector[]) {
    // First pass: create all darts and set theta0
    triangles.forEach((triangle, face) => {
      const {a, b, c} = triangle

      const d1 = this.addDart(a, face, b);
      const d2 = this.addDart(b, face, c);
      const d3 = this.addDart(c, face, a);

      const d4 = this.addDart(b, face, a)
      const d5 = this.addDart(c, face, b)
      const d6 = this.addDart(a, face, c)

      this.setTheta0(d1, d4);
      this.setTheta0(d2, d5);
      this.setTheta0(d3, d6);
    })

    // Second pass: set theta1 based on counterclockwise ordering
    for (const [vertex, darts] of this.vertexDarts.entries()) {
      this.setTheta1ForVertex(vertex, darts, points);
    }
  }

  private addDart(origin: number, face: number, next: number): Dart {
    const key = `${origin}-${next}`;
    if (this.dartMap.has(key)) {
      return this.dartMap.get(key)!;
    }
    const dart: Dart = { index: this.darts.length, origin, face, next, removed: false };
    this.darts.push(dart);
    this.dartMap.set(key, dart);

    this.addToVertexDarts(dart)
    return dart;
  }

  private setTheta0(d1: Dart, d2: Dart) {
    this.theta0.set(d1, d2);
    this.theta0.set(d2, d1);
  }

  private setTheta1(d1: Dart, d2: Dart) {
    this.theta1.set(d1, d2);
  }  

  private addToVertexDarts(dart: Dart) {
    if (!this.vertexDarts.has(dart.origin)) {
      this.vertexDarts.set(dart.origin, []);
    }
    this.vertexDarts.get(dart.origin)!.push(dart);
  }

  private setTheta1ForVertex(vertex: number, darts: Dart[], points: Vector[]) {
    darts.sort((a, b) => {
      return this.counterClockwiseCompare(points[vertex], points[a.next], points[b.next]);
    });

    for (let i = 0; i < darts.length; i++) {
      this.setTheta1(darts[i], darts[(i + 1) % darts.length]);
    }
  }

  private counterClockwiseCompare(center: Vector, a: Vector, b: Vector): number {
    const angleA = Math.atan2(a.y - center.y, a.x - center.x);
    const angleB = Math.atan2(b.y - center.y, b.x - center.x);
    return angleB - angleA;
  }

  t0(d: Dart | undefined): Dart | undefined {
    if (!d) return undefined
    const result = this.theta0.get(d);
    return result ? result : undefined;
  }

  t1(d: Dart | undefined, skipRemoved: boolean = true): Dart | undefined {
    if (!d) return undefined
    let result = this.theta1.get(d);
    if (skipRemoved) {
      while (result && result.removed) {
        result = this.theta1.get(result);
      }
    }
    return result;
  }

  reveal(d: Dart): Dart {
    if (this.t0(this.t1(this.t0(this.t1(this.t0(this.t1(d)))!)!)!)! === d) {
      return this.t1(d)!;
    } else {
      return this.t0(this.t1(this.t0(this.t1(this.t0(d)!)!)!)!)!;
    }
  }

  public boundaryEdges(): [Dart, Dart][] {
    console.log('dart length', this.darts);
    const edgeMap = new Map<string, [Dart, Dart]>();

    for (const dart of this.darts) {
      const theta0Dart = this.theta0.get(dart)!;
      if (this.isBoundaryEdge(dart, theta0Dart)) {
        const [d1, d2] = dart.index < theta0Dart.index ? [dart, theta0Dart] : [theta0Dart, dart];
        const key = `${d1.index}-${d2.index}`;
        edgeMap.set(key, [d1, d2]);
      }
    }

    return Array.from(edgeMap.values());
  }

  // Attempts to "walk" around the triangle in a clockwise direction, starting at the specified dart. 
  // If the result is the same dart, it means there is a closed triangle formed between d and theta1(d)
  clockwiseLoop(d: Dart): Dart | undefined {
    return this.t1(this.t0(this.t1(this.t0(this.t1(this.t0(d))))));
  }

  boundaryEdgeInfo(d1: Dart, d2: Dart) {
    if (!d1 || !d2 || d1.removed || d2.removed) return undefined;

    return {
      d1: this.clockwiseLoop(d1),
      d2: this.clockwiseLoop(d2),
    }
  }

  isBoundaryEdge(d1: Dart, d2: Dart): boolean {
    if (!d1 || !d2 || d1.removed || d2.removed) return false;
    return !(this.clockwiseLoop(d1) === d1 && this.clockwiseLoop(d2) === d2);
  }

  edgeLength(d: Dart): number {
    return Vector.dist(this.points[d.origin], this.points[d.next])
  }

  isBoundaryVertex(vertexIndex: number): boolean {
    const vertex = this.vertexDarts.get(vertexIndex)
    return vertex?.some(d => this.isBoundaryEdge(d, this.t0(d)!)) ?? false
  }

  isRegularRemoval(d1: Dart, d2: Dart): boolean {
    if (!this.isBoundaryEdge(d1, d2)) {
      return false;
    }

    const revealedDart = this.reveal(d1);
    const exposedVertex = this.t0(revealedDart)!.origin;
    return !this.isBoundaryVertex(exposedVertex);
  }

  removeEdge(d1: Dart, d2: Dart) {
    d1.removed = true;
    d2.removed = true;

    this.dartMap.delete(`${d1.origin}-${d1.next}`);
    this.dartMap.delete(`${d2.origin}-${d2.next}`);
  }

  revealedEdges(d1: Dart, d2: Dart): [Dart, Dart] {
    return [this.reveal(d1), this.reveal(d2)];
  }
}