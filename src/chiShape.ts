import { Delaunay } from 'd3-delaunay';
import { Vector } from './vector';
import { CombinatorialMap } from './CombinatorialMap';
import { Triangle } from './CombinatorialMap';

interface Edge {
  a: number;
  b: number;
  length: number;
}

export class ChiShapeComputer {
  private points: Vector[];
  private lambda: number;
  private delaunayTriangles: Triangle[];
  private combinatorialMap: CombinatorialMap;
  private lengthThreshold: number;
  private boundaryEdges: Edge[];
  private removedEdges: Edge[];
  private computedChiShape: Vector[] | null;

  constructor(points: Vector[], lambda: number) {
    this.points = points;
    this.lambda = lambda;
    this.delaunayTriangles = this.computeDelaunayTriangles();
    this.combinatorialMap = new CombinatorialMap(this.delaunayTriangles, this.points);
    this.boundaryEdges = this.computeSortedBoundaryEdges();
    this.lengthThreshold = this.calculateLengthThreshold();
    this.removedEdges = [];
    this.computedChiShape = null;
  }

  public chiShape(): Vector[] {
    if (this.computedChiShape === null) {
      this.computedChiShape = this.computeChiShape();
    }
    return this.computedChiShape;
  }

  public getDelaunayTriangles(): Triangle[] {
    return this.delaunayTriangles;
  }

  public getRemovedEdges(): Edge[] {
    return this.removedEdges;
  }

  public getLengthThreshold(): number {
    return this.lengthThreshold;
  }

  public getCombinatorialMap(): CombinatorialMap {
    return this.combinatorialMap;
  }

  private computeDelaunayTriangles(): Triangle[] {
    const pointArrays = this.points.map(p => [p.x, p.y] as [number, number]);
    const delaunay = new Delaunay(pointArrays.flat());
    return Array.from({ length: delaunay.triangles.length / 3 }, (_, i) => {
        return {
          a: delaunay.triangles[i*3], 
          b: delaunay.triangles[i*3+1], 
          c: delaunay.triangles[i*3+2]
        }
      }
    );
  }

  private calculateLengthThreshold(): number {
    if (this.boundaryEdges.length === 0) {
      return 0;
    }
    const maxLength = this.boundaryEdges[0].length;
    const minLength = this.boundaryEdges[this.boundaryEdges.length - 1].length;
    return minLength + this.lambda * (maxLength - minLength);
  }

  private computeSortedBoundaryEdges(): Edge[] {
    const boundaryEdges: Set<string> = new Set();
    for (let i = 0; i < this.combinatorialMap.darts.length; i += 1) {
      const d1 = this.combinatorialMap.darts[i];
      const d2 = this.combinatorialMap.theta0.get(d1)!;
      if (this.combinatorialMap.isBoundaryEdge(d1, d2)) {
        const [minIndex, maxIndex] = [d1.origin, d2.origin].sort((a, b) => a - b);
        boundaryEdges.add(`${minIndex}-${maxIndex}`);
      }
    }

    const edgeArray = Array.from(boundaryEdges).map(edge => {
      const [a, b] = edge.split('-').map(Number);
      return { a, b, length: Vector.dist(this.points[a], this.points[b]) };
    });

    edgeArray.sort((e1, e2) => e2.length - e1.length);
    return edgeArray;
  }

  private computeChiShape(): Vector[] {
    const chiShape = new Set(this.boundaryEdges.map(e => `${e.a}-${e.b}`));
    
    for (const edge of this.boundaryEdges) {
      const { a, b, length } = edge;
      const d1 = this.combinatorialMap.dartMap.get(`${a}-${b}`);
      const d2 = this.combinatorialMap.dartMap.get(`${b}-${a}`);
      
      if (!d1 || !d2 || d1.removed || d2.removed) continue;
      
      const isRegular = this.combinatorialMap.isRegularRemoval(d1, d2);
      const exceedsLength = length > this.lengthThreshold;

      if (isRegular && exceedsLength) {
        const [r1, r2] = this.combinatorialMap.revealedEdges(d1, d2);

        this.combinatorialMap.removeEdge(d1, d2);
        this.removedEdges.push({
          a: a,
          b: b,
          length: length
        });

        chiShape.delete(`${a}-${b}`);

        chiShape.add(`${r1.origin}-${r1.next}`);
        chiShape.add(`${r2.origin}-${r2.next}`);
      }
    }

    return this.sortEdges(chiShape);
  }

  private sortEdges(edges: Set<string>): Vector[] {
    if (edges.size === 0) return [];

    const edgeList = Array.from(edges).map(edge => edge.split('-').map(Number));
    const sortedPoints: number[] = [];
    const used = new Set<string>();

    sortedPoints.push(edgeList[0][0], edgeList[0][1]);
    used.add(edgeList[0].join('-'));

    while (used.size < edges.size) {
      const last = sortedPoints[sortedPoints.length - 1];
      const nextEdge = edgeList.find(edge => 
        !used.has(edge.join('-')) && (edge[0] === last || edge[1] === last)
      );

      if (!nextEdge) break;

      used.add(nextEdge.join('-'));
      if (nextEdge[0] === last) {
        sortedPoints.push(nextEdge[1]);
      } else {
        sortedPoints.push(nextEdge[0]);
      }
    }

    return sortedPoints.map(i => this.points[i]);
  }
}