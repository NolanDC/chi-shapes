import { Delaunay } from 'd3-delaunay';
import { Vector } from './vector';

export interface Edge {
  start: Vector,
  end: Vector,
  isRegular: boolean,
  withinLength: boolean
}

interface ChiShapeResult {
  chiShape: Vector[];
  delaunayTriangles: [number, number, number][];
  outsideEdges: Edge[];
  lengthThreshold: number;
}

class Dart {
  constructor(public from: number, public to: number) {}
}

function calculateChiShape(points: Vector[], lambda: number): ChiShapeResult {
  const pointArrays = points.map(p => [p.x, p.y] as [number, number]);
  const delaunay = new Delaunay(pointArrays.flat());
  const triangles = delaunay.triangles;

  // Step 1: Construct the Delaunay triangulation Δ of P
  const triangleTuples: [number, number, number][] = [];
  for (let i = 0; i < triangles.length; i += 3) {
    triangleTuples.push([triangles[i], triangles[i + 1], triangles[i + 2]]);
  }
  console.log('tuples: ', triangleTuples);

  // Step 2: Construct the list B of boundary edges


  const edgeCounts = new Map<string, number>();
  triangleTuples.forEach(([a, b, c]) => {
    const edges = [[a, b], [b, c], [c, a]];
    edges.forEach(([from, to]) => {
      const edgeKey = from < to ? `${from},${to}` : `${to},${from}`;
      edgeCounts.set(edgeKey, (edgeCounts.get(edgeKey) || 0) + 1);
    });
  });
  console.log('hi');
  

  const boundaryEdges = Array.from(edgeCounts.entries())
    .filter(([_, count]) => count === 1)
    .map(([key, _]) => {
      const [from, to] = key.split(',').map(Number);
      return new Dart(from, to);
    });

  console.log('edge counts', edgeCounts)
  const B = boundaryEdges.sort((a, b) => 
    Vector.dist(points[b.from], points[b.to]) - Vector.dist(points[a.from], points[a.to])
  );

  console.log('edges length', B.length)
  // Step 3: Sort B in descending order of edge length
  B.sort((a, b) => 
    Vector.dist(points[b.from], points[b.to]) - Vector.dist(points[a.from], points[a.to])
  );

  // Calculate length threshold
  let lengthThreshold = 0;
  if (B.length > 0) {
    const minLength = Vector.dist(points[B[B.length-1].from], points[B[B.length-1].to]);
    const maxLength = Vector.dist(points[B[0].from], points[B[0].to]);
    lengthThreshold = minLength + lambda * (maxLength - minLength);
  }

  // Step 4-15: Main loop of the algorithm
  const v_boundary = new Set<number>();
  B.forEach(dart => {
    v_boundary.add(dart.from);
    v_boundary.add(dart.to);
  });

  const outsideEdges: Edge[] = [];

  while (B.length > 0) {
    const e = B.shift()!;
    const edgeLength = Vector.dist(points[e.from], points[e.to]);
    const withinLength = edgeLength > lengthThreshold;
    const isRegularEdge = isRegular(delaunay, e, v_boundary);

    outsideEdges.push({
      start: points[e.from],
      end: points[e.to],
      isRegular: isRegularEdge,
      withinLength: withinLength
    });

    if (withinLength && isRegularEdge) {
      // Remove edge e from triangulation Δ
      const thirdVertex = triangleTuples.find(
        t => t.includes(e.from) && t.includes(e.to)
      )?.find(v => v !== e.from && v !== e.to);

      if (thirdVertex !== undefined) {
        v_boundary.add(thirdVertex);

        // Insert the two new boundary edges
        const newDart1 = new Dart(e.from, thirdVertex);
        const newDart2 = new Dart(thirdVertex, e.to);
        insertSorted(B, newDart1, points);
        insertSorted(B, newDart2, points);
      }
    }
  }

  // Construct the final polygon
  const chiShape = Array.from(v_boundary).map(i => points[i]);

  return { 
    chiShape, 
    delaunayTriangles: triangleTuples, 
    outsideEdges,
    lengthThreshold 
  };
}

function isRegular(delaunay: Delaunay<[number, number]>, edge: Dart, v_boundary: Set<number>): boolean {
  const thirdVertex = Array.from(delaunay.neighbors(edge.from)).find(
    v => v !== edge.to && !v_boundary.has(v)
  );
  return thirdVertex !== undefined;
}

function insertSorted(B: Dart[], dart: Dart, points: Vector[]) {
  const length = Vector.dist(points[dart.from], points[dart.to]);
  const index = B.findIndex(d => Vector.dist(points[d.from], points[d.to]) <= length);
  if (index === -1) {
    B.push(dart);
  } else {
    B.splice(index, 0, dart);
  }
}

export { calculateChiShape };