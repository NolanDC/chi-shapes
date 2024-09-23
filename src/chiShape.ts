import { Delaunay } from 'd3-delaunay';
import { Vector } from './vector';
import { within } from '@testing-library/react';

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

// Helper function to check regularity of triangulation after edge removal
function isRegular(delaunay: Delaunay<[number, number]>, edge: [number, number], triangles: [number, number, number][]): boolean {
  // Ensure that the removal of this edge will not violate the triangulation structure
  // by checking if the third vertex is still part of the triangulation
  const [a, b] = edge;
  
  // Find the triangle adjacent to the edge
  const adjacentTriangles = triangles.filter(tri => tri.includes(a) && tri.includes(b));

  if (adjacentTriangles.length !== 1) {
    // The edge must belong to exactly one triangle to be a boundary edge
    return false;
  }

  const [v1, v2, v3] = adjacentTriangles[0];
  
  // Check if removing the edge still connects the vertex correctly
  const thirdVertex = v1 === a || v1 === b ? (v2 === a || v2 === b ? v3 : v2) : v1;
  
  return Array.from(delaunay.neighbors(thirdVertex)).length > 1; // Ensure third vertex has other connections
}

export function calculateChiShape(points: Vector[], lambda: number): ChiShapeResult {
  if (points.length < 3) {
    // Return an empty result if there are fewer than 3 points
    return { chiShape: [], delaunayTriangles: [], outsideEdges: [], lengthThreshold: 0 };
  }

  // Convert Vector objects to arrays for d3-delaunay
  const pointArrays = points.map(p => [p.x, p.y]);
  
  // Create Delaunay triangulation
  const delaunay = new Delaunay(pointArrays.flat());
  const triangles = delaunay.triangles;
  
  // Initialize edge list
  let edges: [number, number][] = [];
  for (let i = 0; i < triangles.length; i += 3) {
    edges.push([triangles[i], triangles[i+1]]);
    edges.push([triangles[i+1], triangles[i+2]]);
    edges.push([triangles[i+2], triangles[i]]);
  }
  
  // Identify boundary edges
  const edgeCounts = new Map<string, number>();
  edges.forEach(edge => {
    const edgeKey = edge.sort().toString();
    edgeCounts.set(edgeKey, (edgeCounts.get(edgeKey) || 0) + 1);
  });
  
  // Filter and sort boundary edges
  const boundaryEdges = edges
    .filter(edge => edgeCounts.get(edge.sort().toString()) === 1)
    .sort((a, b) => 
      Vector.dist(points[b[0]], points[b[1]]) - Vector.dist(points[a[0]], points[a[1]])
    );
  
  // Filter edges based on lambda
  const minLength = Vector.dist(points[boundaryEdges[boundaryEdges.length-1][0]], points[boundaryEdges[boundaryEdges.length-1][1]]);
  const maxLength = Vector.dist(points[boundaryEdges[0][0]], points[boundaryEdges[0][1]]);
  const lengthThreshold = minLength + lambda * (maxLength - minLength);
  
  const triangleTuples: [number, number, number][] = [];
  for (let i = 0; i < delaunay.triangles.length; i += 3) {
    triangleTuples.push([delaunay.triangles[i], delaunay.triangles[i + 1], delaunay.triangles[i + 2]]);
  }
  
  const filteredEdges = boundaryEdges.filter(edge => {
    const edgeLength = Vector.dist(points[edge[0]], points[edge[1]]);
    return edgeLength > lengthThreshold && isRegular(delaunay, edge, triangleTuples);
  });

  console.log('edges: ', boundaryEdges.length, ', filtered: ', filteredEdges.length)
  
  // Extract boundary polygon
  let polygon: Vector[] = [];
  if (filteredEdges.length > 0) {
    let start = filteredEdges[0][0];
    let current = filteredEdges[0][1];
    polygon.push(points[start]);
    
    while (current !== start) {
      polygon.push(points[current]);
      const nextEdge = filteredEdges.find(e => 
        (e[0] === current && !polygon.includes(points[e[1]])) ||
        (e[1] === current && !polygon.includes(points[e[0]]))
      );
      if (!nextEdge) break;
      current = (nextEdge[0] === current) ? nextEdge[1] : nextEdge[0];
    }
  }
  
  // Prepare Delaunay triangles for rendering
  const delaunayTriangles: [number, number, number][] = [];
  for (let i = 0; i < triangles.length; i += 3) {
    delaunayTriangles.push([triangles[i], triangles[i+1], triangles[i+2]]);
  }

  const outsideEdges = boundaryEdges.map(e => { 
    return {
      start: points[e[0]], 
      end: points[e[1]],
      isRegular: isRegular(delaunay, e, triangleTuples),
      withinLength: Vector.dist(points[e[0]], points[e[1]]) < lengthThreshold
    } 
  })
  return { chiShape: polygon, delaunayTriangles, outsideEdges, lengthThreshold };
}
