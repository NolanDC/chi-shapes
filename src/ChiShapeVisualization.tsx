import React, { useState, useEffect, useMemo, useRef } from 'react';
import styled from '@emotion/styled';
import { Vector } from './vector';
import { ChiShapeComputer } from './chiShape';
import { CombinatorialMap, Dart, Triangle } from './CombinatorialMap';
import { DartView } from './DartView';
import { TriangleView } from './TriangleView';
import { Vertex } from './Vertex';
import SliderControl from './SliderControl';
import { Slider, Checkbox } from '@mantine/core';


const Container = styled.div`
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
`;

const InfoPanel = styled.div`
  width: 250px;
  padding: 10px;
  background: #f0f0f0;
  overflow-y: auto;
`;

const VisualizationContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const SVGContainer = styled.div`
  flex: 1;
  position: relative;
`;

const ChiShapeVisualization: React.FC = () => {
  const [points, setPoints] = useState<Vector[]>([]);
  const [lambda, setLambda] = useState(0.1);
  const [lengthThresh, setLengthThresh] = useState(0);
  const [hoveredDart, setHoveredDart] = useState<Dart | null>(null);
  const [hoveredTheta0, setHoveredTheta0] = useState<Dart | null>(null);
  const [hoveredTheta1, setHoveredTheta1] = useState<Dart | null>(null);
  const [combinatorialMap, setCombinatorialMap] = useState<CombinatorialMap>();
  const [delaunayTriangles, setDelaunayTriangles] = useState<Triangle[]>();
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [stepIndex, setStepIndex] = useState<number>(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const [showDarts, setShowDarts] = useState(true);
  const [showDelaunay, setShowDelaunay] = useState(true);  

  const containerRef = useRef<HTMLDivElement>(null);
  const INFO_COLUMN_WIDTH = 250;

  const steps = useMemo(() => new ChiShapeComputer(points, lambda).getComputationSteps(), [points, lambda]);
  const currentStep = useMemo(() => steps[stepIndex], [steps, stepIndex]);

  useEffect(() => {
    if (points.length < 3) {
      setLengthThresh(0);
      setCombinatorialMap(undefined);
      setDelaunayTriangles(undefined);
      setStepIndex(0)
      return;
    }

    try {
      const t1 = new Date().getMilliseconds()
      const chiShapeComputer = new ChiShapeComputer(points, lambda);
      setLengthThresh(chiShapeComputer.getLengthThreshold());
      setCombinatorialMap(chiShapeComputer.getCombinatorialMap());
      setDelaunayTriangles(chiShapeComputer.getDelaunayTriangles());
      setStepIndex(steps.length-1)
    } catch (error) {
      console.error("Error calculating Chi Shape:", error);
    }
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

  const randomPoints = (num: number) => {
    if (!svgRef.current) return [];

    const svgRect = svgRef.current.getBoundingClientRect();
    const padding = 40
    const width = svgRect.width - padding*2;
    const height = svgRect.height - padding*2;
    

    return Array.from({ length: num }, () => 
      new Vector(Math.random() * width + padding, Math.random() * height + padding)
    );
  };

  const simplePoints = () => {
    return [
      new Vector(224 * 2, 323 * 2),
      new Vector(216 * 2, 165 * 2),
      new Vector(62 * 2, 407 * 2),
      new Vector(273 * 2, 375 * 2)
    ]
  }


  useEffect(() => {

    setPoints(randomPoints(20));
    //setPoints(simplePoints());
    
    const handleResize = () => {
      //setPoints(randomPoints(20));
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

  const handleStepChange = (value: number) => {
    setStepIndex(value);
  };

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;

    const svgRect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - svgRect.left;
    const y = e.clientY - svgRect.top;
    const clickedPoint = new Vector(x, y);

    setPoints(prevPoints => {
      const existingPointIndex = prevPoints.findIndex(p => Vector.dist(p, clickedPoint) < 10);
      
      if (existingPointIndex !== -1) {
        return prevPoints.filter((_, index) => index !== existingPointIndex);
      } else {
        return [...prevPoints, clickedPoint];
      }
    });
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
        <p>Edge Length: {combinatorialMap.edgeLength(dart)}</p>
        <p>θ₀: {theta0 ? theta0.index : 'N/A'}</p>
        <p>θ₁: {theta1 ? theta1.index : 'N/A'}</p>
        <p>Boundary Edge: {isBoundary ? 'Yes' : 'No'}</p>
        <p>Boundary Info</p>
        <p>d1 {dart.index}: {boundaryInfo?.d1?.index}</p>
        <p>d2: {combinatorialMap.theta0.get(dart)?.index} {boundaryInfo?.d2?.index}</p>
        <p>Revealed Dart: {/*revealed.index*/}</p>
      </div>
    );
  };

  const renderDelaunayTriangles = () => {
    if (!delaunayTriangles) return null;

    return delaunayTriangles.map((triangle, index) => {
      const {a, b, c} = triangle;
      if (!points[a] || !points[b] || !points[c]) {
        console.warn(`Invalid triangle: ${a}, ${b}, ${c}`);
        return null;
      }
      return (
        <TriangleView
          key={`delaunay-${index}`}
          points={[points[a], points[b], points[c]]}
          stroke="rgba(0, 0, 100, 0.3)"
          strokeWidth={1}
        />
      );
    });
  };

  const renderChiShape = () => {
    //console.log('re-rendering chi shape with current shape', currentStep?.currentChiShape)
    //console.log('re-rendering chi shape with # of points: ', currentStep?.currentChiShape.length)
    const shape = currentStep?.currentChiShape
    if (!shape) return

    const validPoints = shape.filter(e => points[e.d1.origin] !== undefined && points[e.d2.origin] !== undefined);
    if (validPoints.length !== shape.length) {
      console.warn("Some chi shape points are undefined");
    }    

    return (
      <polygon
        points={Array.from(shape.values()).map(p => `${points[p.d1.origin].x},${points[p.d1.origin].y}`).join(' ')}
        fill="rgba(243, 231, 243, 1)"
        stroke="rgba(219, 183, 217, 1)"
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
        console.log('some points are invalid in renderDarts()', e)
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
    <Container>
      <InfoPanel>
        <div style={{ marginBottom: '20px' }}>
          <label>λ value:</label>
          <Slider
            value={lambda}
            onChange={setLambda}
            min={0}
            max={1}
            step={0.01}
            label={(value) => value.toFixed(2)}
            styles={{ root: { width: '100%' } }}
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <Checkbox
            label="Show darts"
            checked={showDarts}
            onChange={(event) => setShowDarts(event.currentTarget.checked)}
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <Checkbox
            label="Show Delaunay triangulation"
            checked={showDelaunay}
            onChange={(event) => setShowDelaunay(event.currentTarget.checked)}
          />
        </div>
        <h3>Chi Shape Computation</h3>
        <p>Step: {stepIndex + 1} / {steps.length}</p>
        {currentStep && (
          <div>
            <p>Type: {currentStep.type}</p>
            {currentStep.type === 'analyze' && (
              <>
                <p>Is Regular: {currentStep.isRegular ? 'Yes' : 'No'}</p>
                <p>Is Boundary: {currentStep.isBoundary ? 'Yes' : 'No'}</p>
              </>
            )}
            <p>Remaining Edges: {currentStep.remainingEdges.length}</p>
          </div>
        )}
        <h3>Dart Information</h3>
        {getDartInfo()}
      </InfoPanel>
      <VisualizationContainer>
        <SVGContainer>
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            onClick={handleSvgClick}
          >
            
            {renderChiShape()}
            {showDelaunay && renderDelaunayTriangles()}
            {showDarts && renderDarts()}
            {renderPoints()}
          </svg>
        </SVGContainer>
        <SliderControl
          stepIndex={stepIndex}
          totalSteps={steps.length}
          onStepChange={handleStepChange}
        />
      </VisualizationContainer>
    </Container>
  );
};

export default ChiShapeVisualization;