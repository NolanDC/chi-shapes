import { Delaunay } from 'd3-delaunay';
import { Vector } from './vector';

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

interface Dart {
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

  addDart(origin: number, face: number, next: number): Dart {
    const key = `${origin}-${next}`;
    if (this.dartMap.has(key)) {
      return this.dartMap.get(key)!;
    }
    const dart: Dart = { index: this.darts.length, origin, face, next };
    this.darts.push(dart);
    this.dartMap.set(key, dart);
    return dart;
  }

  setTheta0(d1: Dart, d2: Dart) {
    this.theta0.set(d1, d2);
    this.theta0.set(d2, d1);
  }

  setTheta1(d1: Dart, d2: Dart) {
    this.theta1.set(d1, d2);
  }

  linkDarts(d1: Dart, d2: Dart) {
    if (!this.theta1.has(d1) && !this.theta1.has(d2)) {
      // Neither dart is linked, create a new cycle
      //console.log('linking ', d1.index, ' to ', d2.index, 'via new link')
      this.setTheta1(d1, d2);
      this.setTheta1(d2, d1);
    } else if (this.theta1.has(d1) && !this.theta1.has(d2)) {
      //console.log('linking ', d1.index, ' to ', d2.index, 'via post insertion')
      // d1 is already linked, insert d2 after it
      const next = this.theta1.get(d1)!;
      this.setTheta1(d1, d2);
      this.setTheta1(d2, next);
    } else if (!this.theta1.has(d1) && this.theta1.has(d2)) {
      //console.log('linking ', d1.index, ' to ', d2.index, 'via prior insertion')
      // d2 is already linked, insert d1 before it
      let prev = d2;
      while (this.theta1.get(prev) !== d2) {
        prev = this.theta1.get(prev)!;
      }
      this.setTheta1(prev, d1);
      this.setTheta1(d1, d2);
    } else {
      //console.log('linking ', d1.index, ' to ', d2.index, 'via a cycle merge')
      // Both darts are already linked, merge their cycles
      const next1 = this.theta1.get(d1)!;
      const next2 = this.theta1.get(d2)!;
      //console.log('setting ', d1.index, ' to ', next1.index, ' in cycle merge')
      //console.log('setting ', d2.index, ' to ', next2.index, ' in cycle merge')
      this.setTheta1(d1, next1);
      this.setTheta1(d2, next2);
    }
  }
}

function buildCombinatorialMap(delaunay: Delaunay<[number, number]>): CombinatorialMap {
  const map = new CombinatorialMap();
  const { triangles } = delaunay;

  if (triangles.length === 0) {
    return map;
  }

  // Step 1: Create darts and set Theta0
  for (let i = 0; i < triangles.length; i += 3) {
    const face = i / 3;
    const [a, b, c] = [triangles[i], triangles[i + 1], triangles[i + 2]];

    const d1 = map.addDart(a, face, b);
    const d2 = map.addDart(b, face, c);
    const d3 = map.addDart(c, face, a);
    const d4 = map.addDart(b, face, a);
    const d5 = map.addDart(c, face, b);
    const d6 = map.addDart(a, face, c);

    // Set Theta0 relationships
    map.setTheta0(d1, d4);
    map.setTheta0(d2, d5);
    map.setTheta0(d3, d6);

    // Set Theta1 relationships
    map.linkDarts(d1, d6);
    map.linkDarts(d2, d4);
    map.linkDarts(d3, d5);
  }


  return map;
}

function isBoundaryEdge(map: CombinatorialMap, d1: Dart, d2: Dart): boolean {
  if (d1.removed || d2.removed) return false;

  const compose = (f: (x: Dart) => Dart, g: (x: Dart) => Dart) => (x: Dart) => f(g(x));
  //const theta0 = (x: Dart) => { console.log('theta0 of ', x.index, ' is ', map.theta0.get(x)); return map.theta0.get(x) ?? x };
  //const theta1 = (x: Dart) => {  console.log('theta1 of ', x.index, ' is ', map.theta1.get(x)); return map.theta1.get(x) ?? x };
  const theta0 = (x: Dart) => { return map.theta0.get(x) ?? x };
  const theta1 = (x: Dart) => { return map.theta1.get(x) ?? x };
  
  const composition = compose(theta1, compose(theta0, compose(theta1, compose(theta0, compose(theta1, theta0)))));
  
  //console.log('is ', d1.index, ' to ', d2.index, ' a boundary edge: ', !(composition(d1) === d1 && composition(d2) === d2))
  //console.log('c(', d1.index, '): ', composition(d1).index)
  //console.log('c(', d2.index, ' ): ', composition(d2).index)
  // According to the paper, it's a boundary edge if the composition doesn't bring both darts back to themselves
  return !(composition(d1) === d1 && composition(d2) === d2);
}

function reveal(map: CombinatorialMap, d: Dart): Dart {
  const theta0 = (x: Dart) => {
    let result = map.theta0.get(x);
    while (result && result.removed) {
      result = map.theta0.get(result);
    }
    return result ?? x;
  };
  const theta1 = (x: Dart) => {
    let result = map.theta1.get(x);
    while (result && result.removed) {
      result = map.theta1.get(result);
    }
    return result ?? x;
  };

  console.log('theta0(theta1(theta0(theta1(theta0(theta1((', d.index, '))))))): ', theta0(theta1(theta0(theta1(theta0(theta1((d))))))))
  // TODO: figure out why this is flipped??
  if (theta0(theta1(theta0(theta1(theta0(theta1(d)))))) === d) {
    console.log('returning theta1 for ', d.index, ' with value: ', theta1(d))
    
    
    return theta1(d)
  } else {
    console.log('returning other thing for ', d.index, ' with value of ', theta0(theta1(theta0(theta1(theta0((d)))))))
    return theta0(theta1(theta0(theta1(theta0((d))))));  ;
    
  }
}

function isBoundaryVertex(map: CombinatorialMap, vertexIndex: number): boolean {
  const dart = map.darts.find(d => d.origin === vertexIndex && !d.removed);
  if (!dart) return false;
  console.log('dart exists...', dart)
  
  let current = dart;
  do {
    if (isBoundaryEdge(map, current, map.theta0.get(current)!)) {
      console.log('is a boundary edge from ', current, ' to ', map.theta0.get(current)!)
      return true;
    }
    console.log('is not a boundary edge from ', current, ' to ', map.theta0.get(current)!)
    current = map.theta1.get(map.theta1.get(current)!)!;
  } while (current !== dart);
  
  return false;
}

function isRegularRemoval(map: CombinatorialMap, d1: Dart, d2: Dart): boolean {
  // Check if the edge is a boundary edge
  if (!isBoundaryEdge(map, d1, d2)) {
    console.log('not a boundary edge');
    return false;
  }

  // Use the reveal function to find the dart that will be exposed
  const revealedDart = reveal(map, d1);
  console.log('revealed dart', revealedDart.index)
  
  // Find the vertex that will be exposed after removal
  const exposedVertex = map.theta0.get(revealedDart)!.origin;
  console.log('exposed vertex', exposedVertex)
  // Check if the exposed vertex is not a boundary vertex
  console.log('is boundary vertex? ', isBoundaryVertex(map, exposedVertex))
  return !isBoundaryVertex(map, exposedVertex);
}

function removeEdge(map: CombinatorialMap, d1: Dart, d2: Dart) {
  // Get the revealed darts
  const r1 = reveal(map, d1);
  const r2 = reveal(map, d2);

  console.log('revealed new darts');
  // Update theta1 for the darts around d1 and d2
  map.setTheta1(map.theta1.get(d1)!, r2);
  map.setTheta1(map.theta1.get(d2)!, r1);

  // Remove d1 and d2 from the map
  map.theta0.delete(d1);
  map.theta0.delete(d2);
  map.theta1.delete(d1);
  map.theta1.delete(d2);

  // Remove d1 and d2 from the darts array
  //map.darts = map.darts.filter(d => d !== d1 && d !== d2);
  d1.removed = true;
  d2.removed = true;

  // Update dartMap
  map.dartMap.delete(`${d1.origin}-${d1.next}`);
  map.dartMap.delete(`${d2.origin}-${d2.next}`);
}

function revealedEdges(map: CombinatorialMap, d1: Dart, d2: Dart): [Dart, Dart] {
  return [reveal(map, d1), reveal(map, d2)];
}

function sortEdges(edges: Set<string>, points: Vector[]): Vector[] {
  if (edges.size === 0) return [];

  const edgeList = Array.from(edges).map(edge => edge.split('-').map(Number));
  const sortedPoints: number[] = [];
  const used = new Set<string>();

  // Start with the first edge
  sortedPoints.push(edgeList[0][0], edgeList[0][1]);
  used.add(edgeList[0].join('-'));

  while (used.size < edges.size) {
    const last = sortedPoints[sortedPoints.length - 1];
    const nextEdge = edgeList.find(edge => 
      !used.has(edge.join('-')) && (edge[0] === last || edge[1] === last)
    );

    if (!nextEdge) break;  // This shouldn't happen in a valid chi shape

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
  const map = buildCombinatorialMap(delaunay);
  console.log('map', map)
  // Find boundary edges
  const boundaryEdges: Set<string> = new Set();
  for (let i = 0; i < map.darts.length; i += 1) {
    const d1 = map.darts[i];
    if (d1.removed) continue;
    const d2 = map.theta0.get(d1)!;
    if (d2.removed) continue;
    if (isBoundaryEdge(map, d1, d2)) {
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

  // Sort boundary edges by length
  edgeArray.sort((e1, e2) => e2.length - e1.length);
  edgeArray.forEach((e) => console.log('edge: ', e))

  // Calculate length threshold
  const maxLength = edgeArray[0].length;
  const minLength = edgeArray[edgeArray.length - 1].length;
  
  const lengthThreshold = minLength + lambda * (maxLength - minLength);

  // Filter edges based on length and regularity
  const chiShape = new Set(edgeArray.map(e => `${e.a}-${e.b}`));
  const removedEdges: Edge[] = [];

  for (let i = 0; i < edgeArray.length; i++) {
    const { a, b, length } = edgeArray[i];
    const d1 = map.dartMap.get(`${a}-${b}`);
    const d2 = map.dartMap.get(`${b}-${a}`);
    
    if (!d1 || !d2 || d1.removed || d2.removed) continue;
    
    console.log('')
    console.log('------ evaluating edge ', d1.index, ' to ', d2.index, ' -------')
    console.log('')
    const isRegular = isRegularRemoval(map, d1, d2);
    const exceedsLength = length > lengthThreshold;

    console.log('edge between ', d1.index, ' and ', d2.index, ' is ', length, ' exceeds: ', exceedsLength, ' regular: ', isRegular)
    if (isRegular && exceedsLength) {

      const [r1, r2] = revealedEdges(map, d1, d2);

      removeEdge(map, d1, d2);
      console.log('removing edge')
      removedEdges.push({
        start: points[a],
        end: points[b],
        isRegular: true,
        exceedsLength: true
      });

      // Remove the current edge from chiShape
      chiShape.delete(`${a}-${b}`);

      // Add revealed edges to chiShape and edgeArray
      
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

  // Convert chiShape back to a set of points
  const chiShapePoints = new Set<number>();
  for (const edge of chiShape) {
    
    const [a, b] = edge.split('-').map(Number);
    chiShapePoints.add(a);
    chiShapePoints.add(b);
  }
  console.log('%c chi shape edges', 'background: #222; color: #bada55', chiShape)

  // Prepare Delaunay triangles for rendering
  const delaunayTriangles: [number, number, number][] = [];
  for (let i = 0; i < delaunay.triangles.length; i += 3) {
    delaunayTriangles.push([
      delaunay.triangles[i],
      delaunay.triangles[i + 1],
      delaunay.triangles[i + 2]
    ]);
  }

  console.log('ending shape', chiShape)
  const sortedChiShape = sortEdges(chiShape, points);
  console.log('sorted shape', sortedChiShape)

  return {
    chiShape: sortedChiShape,
    delaunayTriangles,
    removedEdges,
    lengthThreshold,
    combinatorialMap: map
  };
}