import { Vector } from '../math/vector';
import { Edge } from '../math/ChiShapeComputer';
import { CombinatorialMap } from '../math/CombinatorialMap';
import { useMemo } from 'react';

interface DelaunayTriangulationProps {
  combinatorialMap: CombinatorialMap
  points: Vector[];
}

function DelaunayTriangulation({ combinatorialMap, points }: DelaunayTriangulationProps) {

  const delaunayEdges = useMemo(() => {
    if (!combinatorialMap || points.length === 0) return [];
  
    const edgeMap = new Map<string, Edge>();
  
    combinatorialMap.darts.forEach(dart => {
      const theta0 = combinatorialMap.t0(dart);
      if (!theta0) return;
  
      const edgeKey = [dart.index, theta0.index].sort().join('-');
      if (!edgeMap.has(edgeKey)) {
        edgeMap.set(edgeKey, {
          d1: dart,
          d2: theta0,
          length: points[dart.origin].dist(points[dart.next])
        });
      }
    });
  
    return Array.from(edgeMap.values());
  }, [combinatorialMap, points]);

  return (
    <>
      {delaunayEdges.map((edge, index) => {
        const start = points[edge.d1.origin];
        const end = points[edge.d1.next];
        
        return (
          <line
            key={`delaunay-edge-${index}`}
            x1={start.x}
            y1={start.y}
            x2={end.x}
            y2={end.y}
            stroke="rgba(0, 0, 100, 0.3)"
            strokeDasharray="4 4"
            strokeWidth={1}
          />
        );
      })}
    </>
  );
}

export default DelaunayTriangulation;