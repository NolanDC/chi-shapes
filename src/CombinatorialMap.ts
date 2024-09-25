import { Vector } from './vector';

export interface Dart {
  index: number;
  origin: number;
  face: number;
  next: number;
  removed?: boolean;
}

export class CombinatorialMap {
  darts: Dart[] = [];
  theta0: Map<Dart, Dart> = new Map();
  theta1: Map<Dart, Dart> = new Map();
  dartMap: Map<string, Dart> = new Map();
  vertexDarts: Map<number, Dart[]> = new Map();

  constructor(triangles?: Uint32Array, points?: Vector[]) {
    if (triangles && triangles.length > 0 && points && points.length > 0) {
      this.buildFromTriangles(triangles, points);
    }
  }

  private buildFromTriangles(triangles: Uint32Array, points: Vector[]) {
    // First pass: create all darts and set theta0
    for (let i = 0; i < triangles.length; i += 3) {
      const face = i / 3;
      const [a, b, c] = [triangles[i], triangles[i + 1], triangles[i + 2]];

      const d1 = this.addDart(a, face, b);
      const d2 = this.addDart(b, face, c);
      const d3 = this.addDart(c, face, a);

      const d4 = this.addDart(b, face, a)
      const d5 = this.addDart(c, face, b)
      const d6 = this.addDart(a, face, c)

      // Set theta0 (opposite darts)
      this.setTheta0(d1, d4);
      this.setTheta0(d2, d5);
      this.setTheta0(d3, d6);

      // Add darts to vertexDarts
      this.addToVertexDarts(d1);
      this.addToVertexDarts(d2);
      this.addToVertexDarts(d3);
      this.addToVertexDarts(d4);
      this.addToVertexDarts(d5);
      this.addToVertexDarts(d6);
    }

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
    return dart;
  }

  private setTheta0(d1: Dart, d2: Dart) {
    this.theta0.set(d1, d2);
    this.theta0.set(d2, d1);
  }

  private addToVertexDarts(dart: Dart) {
    if (!this.vertexDarts.has(dart.origin)) {
      this.vertexDarts.set(dart.origin, []);
    }
    this.vertexDarts.get(dart.origin)!.push(dart);
  }

  private setTheta1ForVertex(vertex: number, darts: Dart[], points: Vector[]) {
    const center = points[vertex];
    darts.sort((a, b) => {
      const aNext = points[a.next];
      const bNext = points[b.next];
      return this.counterClockwiseCompare(center, aNext, bNext);
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

  private setTheta1(d1: Dart, d2: Dart) {
    this.theta1.set(d1, d2);
  }

  t0(d: Dart | undefined): Dart | undefined {
    if (!d) return undefined
    const result = this.theta0.get(d);
    return result && !result.removed ? result : undefined;
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

  boundaryEdgeInfo(d1: Dart, d2: Dart) {
    if (!d1 || !d2 || d1.removed || d2.removed) return undefined;

    const compose = (f: (x: Dart) => Dart, g: (x: Dart) => Dart) => (x: Dart) => f(g(x));
    const theta0 = (x: Dart) => this.t0(x) ?? x;
    const theta1 = (x: Dart) => this.t1(x) ?? x;
    
    const composition = compose(theta1, compose(theta0, compose(theta1, compose(theta0, compose(theta1, theta0)))));

    return {
      d1: composition(d1),
      d2: composition(d2),
      d1alt: theta1(theta0(theta1(theta0(theta1(theta0(d1)))))),
      d2alt: theta1(theta0(theta1(theta0(theta1(theta0(d2))))))
    }
  }  

  isBoundaryEdge(d1: Dart, d2: Dart): boolean {
    if (!d1 || !d2 || d1.removed || d2.removed) return false;

    const compose = (f: (x: Dart) => Dart, g: (x: Dart) => Dart) => (x: Dart) => f(g(x));
    const theta0 = (x: Dart) => this.t0(x) ?? x;
    const theta1 = (x: Dart) => this.t1(x) ?? x;
    
    const composition = compose(theta1, compose(theta0, compose(theta1, compose(theta0, compose(theta1, theta0)))));
    
    return !(composition(d1) === d1 && composition(d2) === d2);
  }

  isBoundaryVertex(vertexIndex: number): boolean {
    const dart = this.darts.find(d => d.origin === vertexIndex && !d.removed);
    if (!dart) return false;
    
    let current = dart;
    do {
      if (this.isBoundaryEdge(current, this.t0(current)!)) {
        return true;
      }
      current = this.t1(this.t1(current)!)!;
    } while (current !== dart);
    
    return false;
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