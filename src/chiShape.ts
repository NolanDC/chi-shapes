import { Delaunay } from 'd3-delaunay';
import { Vector } from './vector';
import { CombinatorialMap, Dart, Triangle } from './CombinatorialMap';

export interface Edge {
  d1: Dart;
  d2: Dart;
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
  private computedChiShape: Edge[] | null;

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

  public chiShape(): Edge[] {
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
    const edges = this.combinatorialMap.boundaryEdges();

    const edgeArray = edges.map(([d1, d2]) => ({
      d1,
      d2,
      length: Vector.dist(this.points[d1.origin], this.points[d2.origin])
    }));

    edgeArray.sort((e1, e2) => e2.length - e1.length);
    return edgeArray;
  }

  private computeChiShape(): Edge[] {
    const chiShape = new Set(this.boundaryEdges);
    let index = 0;

    while (index < this.boundaryEdges.length) {
      const edge = this.boundaryEdges[index];
      const { d1, d2, length } = edge;

      if (d1.removed || d2.removed) {
        this.boundaryEdges.splice(index, 1);
        chiShape.delete(edge);
        continue;
      }

      const isRegular = this.combinatorialMap.isRegularRemoval(d1, d2);
      const exceedsLength = length > this.lengthThreshold;

      if (isRegular && exceedsLength) {
        console.log('removing edge', edge);
        const [r1, r2] = this.combinatorialMap.revealedEdges(d1, d2);
        this.combinatorialMap.removeEdge(d1, d2);
        this.removedEdges.push(edge);

        chiShape.delete(edge);
        this.boundaryEdges.splice(index, 1);

        const newEdge1 = this.createEdge(r1, this.combinatorialMap.t0(r1)!);
        const newEdge2 = this.createEdge(r2, this.combinatorialMap.t0(r2)!);
        console.log('adding edge', newEdge1);
        console.log('adding edge 2', newEdge2);

        this.insertSortedEdge(newEdge1);
        this.insertSortedEdge(newEdge2);

        chiShape.add(newEdge1);
        chiShape.add(newEdge2);

        // Reset index to start checking from the beginning
        index = 0;
      } else {
        index++;
      }
    }

    console.log('chishape length', chiShape.size);
    return this.sortEdges(chiShape);
  }

  private insertSortedEdge(edge: Edge) {
    const index = this.boundaryEdges.findIndex(e => e.length <= edge.length);
    if (index === -1) {
      this.boundaryEdges.push(edge);
    } else {
      this.boundaryEdges.splice(index, 0, edge);
    }
  }

  private createEdge(d1: Dart, d2: Dart): Edge {
    return {
      d1,
      d2,
      length: Vector.dist(this.points[d1.origin], this.points[d2.origin])
    };
  }

  private sortEdges(edges: Set<Edge>): Edge[] {
    if (edges.size === 0) return [];
  
    const sortedEdges: Edge[] = [];
    const remainingEdges = new Set(edges);
  
    // Start with an arbitrary edge
    let currentEdge = remainingEdges.values().next().value;
    remainingEdges.delete(currentEdge);
    sortedEdges.push(currentEdge);
  
    let lastPoint = currentEdge.d2.origin;  // Assume we're starting from d1 to d2
  
    while (remainingEdges.size > 0) {
      const nextEdge = Array.from(remainingEdges).find(edge => 
        edge.d1.origin === lastPoint || edge.d2.origin === lastPoint
      );
  
      if (!nextEdge) {
        throw new Error('Edges do not form a closed perimeter');
      }
  
      // Reorient the darts in the edge if necessary
      if (nextEdge.d2.origin === lastPoint) {
        // Swap d1 and d2
        [nextEdge.d1, nextEdge.d2] = [nextEdge.d2, nextEdge.d1];
      }
  
      sortedEdges.push(nextEdge);
      remainingEdges.delete(nextEdge);
      lastPoint = nextEdge.d2.origin;  // Update lastPoint for the next iteration
    }
  
    // Ensure the last edge connects back to the first edge
    const firstEdge = sortedEdges[0];
    const lastEdge = sortedEdges[sortedEdges.length - 1];
    if (lastEdge.d2.origin !== firstEdge.d1.origin) {
      throw new Error('Edges do not form a closed loop');
    }
  
    return sortedEdges;
  }
}

function arrayIntersection<T>(arr1: T[], arr2: T[]): T[] {
  return arr1.filter(item => arr2.includes(item));
}