import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Vector } from './vector';
import { ChiShapeComputer } from './chiShape';
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
  const [boundaryInfo, setBoundaryInfo] = useState<number>()
  const [chiShape, setChiShape] = useState<Vector[]>()
  const [combinatorialMap, setCombinatorialMap] = useState<CombinatorialMap>()
  const [delaunayTriangles, setDelaunayTriangles] = useState<[number, number, number][]>()
  const [size, setSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const INFO_COLUMN_WIDTH = 250;

  const updateChiShape = useCallback(() => {
    if (points.length < 3) {
      setChiShape(undefined);
      setLengthThresh(0)
      return;
    }
    try {
      const chiShapeComputer = new ChiShapeComputer(points, lambda)
      setChiShape(chiShapeComputer.chiShape())
      setLengthThresh(chiShapeComputer.getLengthThreshold())
      setCombinatorialMap(chiShapeComputer.getCombinatorialMap())
      setDelaunayTriangles(chiShapeComputer.getDelaunayTriangles())

    } catch (error) {
      console.error("Error calculating Chi Shape:", error);
      setChiShape(undefined);
    }

    console.log('points', points);
  }, [points, lambda]);

  useEffect(() => {
    if (hoveredDart && combinatorialMap) {
      setHoveredTheta0(combinatorialMap.t0(hoveredDart) ?? null)
      setHoveredTheta1(combinatorialMap.t1(hoveredDart) ?? null)
    } else {
      setHoveredTheta0(null)
      setHoveredTheta1(null)
    }
  }, [hoveredDart])

  useEffect(() => {
    const generateRandomPoints = () => {
      const width = window.innerWidth - INFO_COLUMN_WIDTH;
      const height = window.innerHeight;

      // broken theta1s
      const vectorArray = [
        new Vector(344, 553),
        new Vector(136, 477),
        new Vector(235, 425),
        new Vector(539, 574),
        new Vector(598, 606),
        new Vector(700, 530),
        new Vector(550, 749),
        new Vector(421, 726),
        new Vector(169, 784)
    ];
    return vectorArray;

      return [
        new Vector(224 * 2, 323 * 2),
        new Vector(164 * 2, 302 * 2),  // {x: 164, y: 302}
        new Vector(216 * 2, 165 * 2),
        new Vector(62 * 2, 407 * 2),
        new Vector(273 * 2, 375 * 2)
      ]
      /*Array.from({ length: 4 }, () => 
        new Vector(Math.random() * width, Math.random() * height)
      );*/
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
    if (hoveredDart === null || !combinatorialMap) return null;

    const dart = combinatorialMap.darts[hoveredDart.index];
    if (!dart) return null;

    const theta0 = combinatorialMap.t0(dart);
    const theta1 = combinatorialMap.t1(dart);
    const isBoundary = combinatorialMap.isBoundaryEdge(dart, combinatorialMap.theta0.get(dart)!);
    const boundaryInfo = combinatorialMap.boundaryEdgeInfo(dart, combinatorialMap.theta0.get(dart)!)
    //const revealed = combinatorialMap.reveal(dart);

    return (
      <div>
        <p>Dart {hoveredDart.index}: from {dart.origin} to {dart.next}</p>
        <p>θ₀: {theta0 ? theta0.index : 'N/A'}</p>
        <p>θ₁: {theta1 ? theta1.index : 'N/A'}</p>
        <p>Boundary Edge: {isBoundary ? 'Yes' : 'No'}</p>
        <p>Boundary Info</p>
        <p>d1 {dart.index}: {boundaryInfo?.d1.index}, {boundaryInfo?.d1alt.index}</p>
        <p>d2: {combinatorialMap.theta0.get(dart)?.index} {boundaryInfo?.d2.index}, {boundaryInfo?.d2alt.index}</p>
        <p>Revealed Dart: {/*revealed.index*/}</p>
      </div>
    );
  };

  const renderDelaunayTriangles = () => {
    if (!delaunayTriangles) return null;

    return delaunayTriangles.map((triangle, index) => {
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
    if (!chiShape) return null;

    const validPoints = chiShape.filter(p => p !== undefined);
    if (validPoints.length !== chiShape.length) {
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
    if (!combinatorialMap) return null;

    return combinatorialMap.darts.map((dart) => {
      const start = points[dart.origin];
      const end = points[dart.next];
      
      if (!start || !end) {
        console.warn(`Invalid dart: ${dart.index}, origin: ${dart.origin}, next: ${dart.next}`);
        return null;
      }

      const theta1Dart = combinatorialMap.t1(dart);
      let theta1End = null
      try {
        theta1End = theta1Dart ? new Vector(
          points[theta1Dart.origin].x + (points[theta1Dart.next].x - points[theta1Dart.origin].x) * 0.3,
          points[theta1Dart.origin].y + (points[theta1Dart.next].y - points[theta1Dart.origin].y) * 0.3
        ) : null;
      } catch (e) {
        console.log(e)
        console.log('theta1end', theta1End)
        console.log('theta1dart', theta1Dart)
        if (theta1Dart) {
          console.log('theta1dart start', points[theta1Dart.origin])
          console.log('theta1dart end', points[theta1Dart.next])
        }
        
      }


      return (
        <DartView
          key={`dart-${dart.index}`}
          dart={dart}
          start={start}
          end={end}
          theta1End={theta1End}
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