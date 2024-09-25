import { Delaunay } from 'd3-delaunay';
import { Vector } from './vector';
import { CombinatorialMap } from './CombinatorialMap';

export interface Edge {
  start: Vector,
  end: Vector,
  isRegular: boolean,
  exceedsLength: boolean
}

export interface ChiShapeResult {
  chiShape: Vector[];
  delaunayTriangles: [number, number, number][];
  removedEdges: Edge[];
  lengthThreshold: number;
  combinatorialMap: CombinatorialMap;
}

function sortEdges(edges: Set<string>, points: Vector[]): Vector[] {
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

  return sortedPoints.map(i => points[i]);
}

export function calculateChiShape(points: Vector[], lambda: number): ChiShapeResult {
  if (points.length < 3) {
    return {
      chiShape: points,
      delaunayTriangles: [],
      removedEdges: [],
      lengthThreshold: 0,
      combinatorialMap: new CombinatorialMap()
    };
  }

  const pointArrays = points.map(p => [p.x, p.y] as [number, number]);
  const delaunay = new Delaunay(pointArrays.flat());
  const map = new CombinatorialMap(delaunay.triangles, points);

  const boundaryEdges: Set<string> = new Set();
  for (let i = 0; i < map.darts.length; i += 1) {
    const d1 = map.darts[i];
    if (d1.removed) continue;
    const d2 = map.theta0.get(d1)!;
    if (d2.removed) continue;
    if (map.isBoundaryEdge(d1, d2)) {
      const [minIndex, maxIndex] = [d1.origin, d2.origin].sort((a, b) => a - b);
      boundaryEdges.add(`${minIndex}-${maxIndex}`);
    }
  }

  const edgeArray = Array.from(boundaryEdges).map(edge => {
    const [a, b] = edge.split('-').map(Number);
    return { a, b, length: Vector.dist(points[a], points[b]) };
  });

  if (edgeArray.length === 0) {
    return {
      chiShape: points,
      delaunayTriangles: [],
      removedEdges: [],
      lengthThreshold: 0,
      combinatorialMap: map
    };
  }

  edgeArray.sort((e1, e2) => e2.length - e1.length);

  const maxLength = edgeArray[0].length;
  const minLength = edgeArray[edgeArray.length - 1].length;
  
  const lengthThreshold = minLength + lambda * (maxLength - minLength);

  const chiShape = new Set(edgeArray.map(e => `${e.a}-${e.b}`));
  const removedEdges: Edge[] = [];
  
  for (let i = 0; i < edgeArray.length; i++) {
    const { a, b, length } = edgeArray[i];
    const d1 = map.dartMap.get(`${a}-${b}`);
    const d2 = map.dartMap.get(`${b}-${a}`);
    
    if (!d1 || !d2 || d1.removed || d2.removed) continue;
    
    const isRegular = map.isRegularRemoval(d1, d2);
    const exceedsLength = length > lengthThreshold;

    if (isRegular && exceedsLength) {
      const [r1, r2] = map.revealedEdges(d1, d2);

      map.removeEdge(d1, d2);
      removedEdges.push({
        start: points[a],
        end: points[b],
        isRegular: true,
        exceedsLength: true
      });

      chiShape.delete(`${a}-${b}`);

      const newEdges = [
        { a: r1.origin, b: r1.next, length: Vector.dist(points[r1.origin], points[r1.next]) },
        { a: r2.origin, b: r2.next, length: Vector.dist(points[r2.origin], points[r2.next]) }
      ];

      for (const newEdge of newEdges) {
        chiShape.add(`${newEdge.a}-${newEdge.b}`);
        const insertIndex = edgeArray.findIndex(e => e.length <= newEdge.length);
        if (insertIndex === -1) {
          edgeArray.push(newEdge);
        } else {
          edgeArray.splice(insertIndex, 0, newEdge);
        }
      }
    }
  }
    

  const delaunayTriangles: [number, number, number][] = [];
  for (let i = 0; i < delaunay.triangles.length; i += 3) {
    delaunayTriangles.push([
      delaunay.triangles[i],
      delaunay.triangles[i + 1],
      delaunay.triangles[i + 2]
    ]);
  }

  const sortedChiShape = sortEdges(chiShape, points);

  return {
    chiShape: sortedChiShape,
    delaunayTriangles,
    removedEdges,
    lengthThreshold,
    combinatorialMap: map
  };
}