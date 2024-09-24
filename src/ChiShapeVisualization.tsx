import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Vector } from './vector';
import { calculateChiShape } from './chiShape';
import { CombinatorialMap, Dart } from './CombinatorialMap';
import { DartView } from './DartView';
import { Triangle } from './Triangle';
import { Vertex } from './Vertex';
import { Line } from './Line';

const ChiShapeVisualization: React.FC = () => {
  const [points, setPoints] = useState<Vector[]>([]);
  const [lambda, setLambda] = useState(0.1);
  const [lengthThresh, setLengthThresh] = useState(0);
  const [hoveredDart, setHoveredDart] = useState<Dart | null>(null);
  const [hoveredTheta0, setHoveredTheta0] = useState<Dart | null>(null)
  const [hoveredTheta1, setHoveredTheta1] = useState<Dart | null>(null)

  const [chiShapeData, setChiShapeData] = useState<{
    chiShape: Vector[];
    delaunayTriangles: [number, number, number][];
    removedEdges: any[];
    lengthThreshold: number;
    combinatorialMap: CombinatorialMap;
  } | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const INFO_COLUMN_WIDTH = 250;

  const updateChiShape = useCallback(() => {
    if (points.length < 3) {
      setChiShapeData(null);
      return;
    }
    try {
      const newChiShapeData = calculateChiShape(points, lambda);
      setChiShapeData(newChiShapeData);
      setLengthThresh(newChiShapeData.lengthThreshold);
    } catch (error) {
      console.error("Error calculating Chi Shape:", error);
      setChiShapeData(null);
    }
  }, [points, lambda]);

  useEffect(() => {
    if (hoveredDart && chiShapeData?.combinatorialMap) {
      setHoveredTheta0(chiShapeData.combinatorialMap.theta0.get(hoveredDart) ?? null)
      setHoveredTheta1(chiShapeData.combinatorialMap.theta1.get(hoveredDart) ?? null)
    } else {
      setHoveredTheta0(null)
      setHoveredTheta1(null)
    }
  }, [hoveredDart])

  useEffect(() => {
    const generateRandomPoints = () => {
      const width = window.innerWidth - INFO_COLUMN_WIDTH;
      const height = window.innerHeight;
      return Array.from({ length: 4 }, () => 
        new Vector(Math.random() * width, Math.random() * height)
      );
    };

    setPoints(generateRandomPoints());
    
    const handleResize = () => {
      setPoints(generateRandomPoints());
      if (containerRef.current) {
        setSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    updateChiShape();
  }, [updateChiShape]);

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const clickedPoint = new Vector(x, y);

    const existingPointIndex = points.findIndex(p => Vector.dist(p, clickedPoint) < 10);
    
    if (existingPointIndex !== -1) {
      setPoints(prevPoints => prevPoints.filter((_, index) => index !== existingPointIndex));
    } else {
      setPoints(prevPoints => [...prevPoints, clickedPoint]);
    }
  };

  const getDartInfo = () => {
    if (hoveredDart === null || !chiShapeData) return null;

    const { combinatorialMap } = chiShapeData;
    const dart = combinatorialMap.darts[hoveredDart.index];
    if (!dart) return null;

    const theta0 = combinatorialMap.theta0.get(dart);
    const theta1 = combinatorialMap.theta1.get(dart);
    const isBoundary = combinatorialMap.isBoundaryEdge(dart, combinatorialMap.theta0.get(dart)!);
    const revealed = combinatorialMap.reveal(dart);

    return (
      <div>
        <p>Dart {hoveredDart.index}: from {dart.origin} to {dart.next}</p>
        <p>θ₀: {theta0 ? theta0.index : 'N/A'}</p>
        <p>θ₁: {theta1 ? theta1.index : 'N/A'}</p>
        <p>Boundary Edge: {isBoundary ? 'Yes' : 'No'}</p>
        <p>Revealed Dart: {revealed.index}</p>
      </div>
    );
  };

  const renderDelaunayTriangles = () => {
    if (!chiShapeData) return null;

    return chiShapeData.delaunayTriangles.map((triangle, index) => {
      const [a, b, c] = triangle;
      if (!points[a] || !points[b] || !points[c]) {
        console.warn(`Invalid triangle: ${a}, ${b}, ${c}`);
        return null;
      }
      return (
        <Triangle
          key={`delaunay-${index}`}
          points={[points[a], points[b], points[c]]}
          stroke="rgba(0, 0, 255, 0.3)"
          strokeWidth={1}
        />
      );
    });
  };

  const renderChiShape = () => {
    if (!chiShapeData) return null;

    const validPoints = chiShapeData.chiShape.filter(p => p !== undefined);
    if (validPoints.length !== chiShapeData.chiShape.length) {
      console.warn("Some chi shape points are undefined");
    }

    return (
      <polygon
        points={validPoints.map(p => `${p.x},${p.y}`).join(' ')}
        fill="none"
        stroke="rgba(128, 0, 128, 0.3)"
        strokeWidth={10}
      />
    );
  };

  const renderDarts = () => {
    if (!chiShapeData) return null;

    return chiShapeData.combinatorialMap.darts.map((dart) => {
      const start = points[dart.origin];
      const end = points[dart.next];
      
      if (!start || !end) {
        console.warn(`Invalid dart: ${dart.index}, origin: ${dart.origin}, next: ${dart.next}`);
        return null;
      }


      return (
        <DartView
          key={`dart-${dart.index}`}
          dart={dart}
          start={start}
          end={end}
          isHovered={hoveredDart === dart}
          highlight={hoveredTheta0 === dart ? 'green' : ((hoveredTheta1 === dart) ? 'blue' : '') }
          onMouseEnter={() => setHoveredDart(dart)}
          onMouseLeave={() => setHoveredDart(null)}
        />
      );
    });
  };

  const renderPoints = () => {
    return points.map((point, index) => (
      <Vertex
        key={`point-${index}`}
        point={point}
        index={index}
      />
    ));
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <div style={{ width: `${INFO_COLUMN_WIDTH}px`, padding: '10px', background: '#f0f0f0', overflowY: 'auto' }}>
        <h3>Dart Information</h3>
        {getDartInfo()}
        <div style={{ marginTop: '20px' }}>
          <label>
            λ value:
            <input
              type="number"
              min="0"
              max="1"
              step="0.01"
              value={lambda}
              onChange={(e) => setLambda(parseFloat(e.target.value))}
            />
          </label>
          <p>Length threshold: {lengthThresh.toFixed(2)}</p>
        </div>
      </div>
      <div ref={containerRef} style={{ position: 'relative', flex: 1 }}>
        <svg
          width="100%"
          height="100%"
          onClick={handleSvgClick}
        >
          {renderDelaunayTriangles()}
          {renderChiShape()}
          {renderDarts()}
          {renderPoints()}
        </svg>
      </div>
    </div>
  );
};

export default ChiShapeVisualization;