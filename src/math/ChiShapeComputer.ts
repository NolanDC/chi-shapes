import { Delaunay } from 'd3-delaunay';
import { Vector } from './vector';
import { CombinatorialMap, Dart, Triangle } from './CombinatorialMap';

export interface Edge {
  d1: Dart;
  d2: Dart;
  length: number;
}

export interface ComputationStep {
  type: 'init' | 'remove' | 'skip';
  edge?: Edge;
  isRegular?: boolean;
  isBoundary?: boolean;
  removedEdges?: Edge[];
  newEdges?: Edge[];
  currentChiShape: Edge[];
  remainingEdges: Edge[];
}


export class ChiShapeComputer {
  private points: Vector[];
  private lambda: number;
  private delaunayTriangles: Triangle[];
  private combinatorialMap: CombinatorialMap;
  private lengthThreshold: number;
  private boundaryEdges: Edge[];
  private removedEdges: Edge[];
  private computationSteps: ComputationStep[];

  constructor(points: Vector[], lambda: number) {
    this.points = points;
    this.lambda = lambda;
    this.delaunayTriangles = this.computeDelaunayTriangles();
    this.combinatorialMap = new CombinatorialMap(this.delaunayTriangles, this.points);
    this.boundaryEdges = this.computeSortedBoundaryEdges();
    this.lengthThreshold = this.calculateLengthThreshold();
    this.removedEdges = [];
    this.computationSteps = [];
    this.computeChiShapeSteps();
  }

  public getComputationSteps(): ComputationStep[] {
    return this.computationSteps;
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
    // Get all edges from the combinatorial map
    const allEdges = this.combinatorialMap.getAllEdges();
    
    if (allEdges.length === 0) {
      return 0;
    }
  
    // Calculate the length of each edge
    const edgeLengths = allEdges.map(([d1, d2]) => 
      this.points[d1.origin].dist(this.points[d2.origin])
    );
  
    // Find the minimum and maximum lengths
    const minLength = Math.min(...edgeLengths);
    const maxLength = Math.max(...edgeLengths);
    
    // Calculate the threshold using lambda
    return minLength + this.lambda * (maxLength - minLength);
  }

  private computeSortedBoundaryEdges(): Edge[] {
    const edges = this.combinatorialMap.boundaryEdges();

    const edgeArray = edges.map(([d1, d2]) => ({
      d1,
      d2,
      length: this.points[d1.origin].dist(this.points[d2.origin])
    }));

    edgeArray.sort((e1, e2) => e2.length - e1.length);
    return edgeArray;
  }

  // Leaving this here for future usage - compute the chi-shape without
  // storing state at each step. May be slightly out of date / need updates to
  // work properly
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
        const [r1, r2] = this.combinatorialMap.revealedEdges(d1, d2);
        this.combinatorialMap.removeEdge(d1, d2);
        this.removedEdges.push(edge);

        chiShape.delete(edge);
        this.boundaryEdges.splice(index, 1);

        const newEdge1 = this.createEdge(r1, this.combinatorialMap.t0(r1)!);
        const newEdge2 = this.createEdge(r2, this.combinatorialMap.t0(r2)!);

        this.insertSortedEdges(this.boundaryEdges, [newEdge1, newEdge2])

        chiShape.add(newEdge1);
        chiShape.add(newEdge2);

        // Reset index to start checking from the beginningg
        index = 0;
      } else {
        index++;
      }
    }

    return this.sortEdges(chiShape);
  }


  private createEdge(d1: Dart, d2: Dart): Edge {
    return {
      d1,
      d2,
      length: this.points[d1.origin].dist(this.points[d2.origin])
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

  private computeChiShapeSteps() {
    const initialBoundaryEdges = this.computeSortedBoundaryEdges();
    
    // Initial step
    this.computationSteps.push({
      type: 'init',
      currentChiShape: this.sortEdges(new Set<Edge>([...initialBoundaryEdges])),
      remainingEdges: [...initialBoundaryEdges]
    });

    while (this.computationSteps[this.computationSteps.length - 1].remainingEdges.length > 0) {
      const lastStep = this.computationSteps[this.computationSteps.length - 1];
      const edge = lastStep.remainingEdges[0];
      const { d1, d2, length } = edge;

      const isRegular = this.combinatorialMap.isRegularRemoval(d1, d2);
      const isBoundary = this.combinatorialMap.isBoundaryEdge(d1, d2);
      const exceedsLength = length > this.lengthThreshold;



      if (isRegular && exceedsLength) {
        const [r1, r2] = this.combinatorialMap.revealedEdges(d1, d2);
        this.combinatorialMap.removeEdge(d1, d2);

        const newEdge1 = this.createEdge(r1, this.combinatorialMap.t0(r1)!);
        const newEdge2 = this.createEdge(r2, this.combinatorialMap.t0(r2)!);

        const newChiShape = lastStep.currentChiShape.filter(e => e !== edge).concat([newEdge1, newEdge2]);
        const newRemainingEdges = this.insertSortedEdges(lastStep.remainingEdges.filter(e => e !== edge), [newEdge1, newEdge2]);

        // Add removal step
        this.computationSteps.push({
          type: 'remove',
          edge: edge,
          isRegular: isRegular,
          isBoundary: isBoundary,              
          removedEdges: [edge],
          newEdges: [newEdge1, newEdge2],
          currentChiShape: this.sortEdges(new Set<Edge>(newChiShape)),
          remainingEdges: newRemainingEdges
        });
      } else {

        // If not removed, just remove from remaining edges
        this.computationSteps.push({
          type: 'skip',
          edge: edge,
          isRegular: isRegular,
          isBoundary: isBoundary,          
          currentChiShape:  this.sortEdges(new Set<Edge>([...lastStep.currentChiShape])),
          remainingEdges: lastStep.remainingEdges.slice(1)
        });
      }
    }
  }

  private insertSortedEdges(edges: Edge[], newEdges: Edge[]): Edge[] {
    const result = [...edges];
    for (const edge of newEdges) {
      const index = result.findIndex(e => e.length <= edge.length);
      if (index === -1) {
        result.push(edge);
      } else {
        result.splice(index, 0, edge);
      }
    }
    return result;
  }
}
