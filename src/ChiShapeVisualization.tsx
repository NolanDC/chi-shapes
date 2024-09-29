import React, { useState, useEffect, useMemo, useRef } from 'react';
import styled from '@emotion/styled';
import { Vector } from './vector';
import { ChiShapeComputer, ComputationStep, Edge} from './chiShape';
import { Dart } from './CombinatorialMap';
import { DartView } from './DartView';
import { Vertex } from './Vertex';
import SliderControl from './SliderControl';
import { Slider, Checkbox } from '@mantine/core';
import Colors from './Colors';

const Container = styled.div`
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
`;

const InfoPanel = styled.div`
  width: 325px;
  padding: 30px;
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

const LambdaSliderContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-contnet: center;
`
const LambdaIcon = styled.div`
  background: #4997bd;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  text-align: center;
  line-height: 30px;
  font-size: 16px;
  font-weight: bold;
  flex-shrink: 0;
  margin-right: 15px;
`

const LambdaValue = styled.div`
  margin-left: 10px;
  width: 35px;
  flex-shrink: 0;
`

const ChiShapeVisualization: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  const [points, setPoints] = useState<Vector[]>([]);
  const [lambda, setLambda] = useState(0.1);
  const [hoveredDart, setHoveredDart] = useState<Dart | null>(null);
  const [stepIndex, setStepIndex] = useState<number>(0);

  const [showDarts, setShowDarts] = useState(false);
  const [showDelaunay, setShowDelaunay] = useState(true);  
  const [showChiShape, setShowChiShape] = useState(true);

  const steps = useMemo(() => new ChiShapeComputer(points, lambda).getComputationSteps(), [points, lambda]);
  const currentStep: ComputationStep = useMemo(() => steps[stepIndex], [steps, stepIndex]);
  const chiShapeComputer = useMemo(() => new ChiShapeComputer(points, lambda), [points, lambda])
  const combinatorialMap = useMemo(() => chiShapeComputer.getCombinatorialMap(), [chiShapeComputer])

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

  useEffect(() => {
    if (steps.length > 0) {
      setStepIndex(steps.length - 1)
    }
  }, [points, lambda]);


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

    setPoints(randomPoints(10));
    //setPoints(simplePoints());

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
      const existingPointIndex = prevPoints.findIndex(p => p.dist(clickedPoint) < 10);
      
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
        <p>Edge Length: {combinatorialMap.edgeLength(dart).toFixed(2)}</p>
        <p>θ₀: {theta0 ? theta0.index : 'N/A'}</p>
        <p>θ₁: {theta1 ? theta1.index : 'N/A'}</p>
        <p>Boundary Edge: {isBoundary ? 'Yes' : 'No'}</p>
      </div>
    );
  };

  const renderDelaunayEdges = () => {
    return delaunayEdges?.map((edge, index) => {
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
    });
  };

  const renderCurrentEdge = () => {
    if (!currentStep || !currentStep.edge) return null;
  
    const { d1, d2 } = currentStep.edge;
    const start = points[d1.origin];
    const end = points[d2.origin];
  
    return (
      <line
        x1={start.x}
        y1={start.y}
        x2={end.x}
        y2={end.y}
        stroke={currentStep.type == 'remove' ? Colors.red : Colors.yellow}
        strokeWidth={10}
      />
    );
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
        fill={Colors.lightPurple}
        stroke={Colors.purple}
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

      const hoveredTheta0 = hoveredDart && combinatorialMap.t0(hoveredDart) === dart
      const hoveredTheta1 = hoveredDart && combinatorialMap.t1(hoveredDart) === dart

      return (
        <DartView
          key={`dart-${dart.index}`}
          dart={dart}
          start={start}
          end={end}
          theta1End={theta1End}
          isHovered={hoveredDart === dart}
          highlight={hoveredTheta0 ? 'green' : (hoveredTheta1 ? 'blue' : '') }
          onMouseEnter={() => setHoveredDart(dart)}
          onMouseLeave={() => setHoveredDart(null)}
        />
      );
    });
  };

  const renderPoints = () => {
    return points.map((point, index) => {
      const isHighlighted = (index == currentStep?.edge?.d1.origin || index == currentStep?.edge?.d2.origin)
      
      const color = currentStep?.type == 'remove' ? Colors.red : Colors.yellow
      const textColor = isHighlighted ? 'black' : 'white'
      return <Vertex
        key={`point-${index}`}
        point={point}
        index={index}
        color={isHighlighted ? color : undefined}
        textColor={textColor}
      />
    });
  };


  return (
    <Container>
      <InfoPanel>
        <div style={{ marginBottom: '20px' }}>
          
          <LambdaSliderContainer>
            <LambdaIcon><span>λ</span></LambdaIcon>
            <Slider
              value={lambda}
              onChange={setLambda}
              min={0}
              max={1}
              step={0.01}
              label={(value) => value.toFixed(2)}
              styles={{ root: { width: '100%' } }}
            />
            <LambdaValue>
              {lambda}
            </LambdaValue>
          </LambdaSliderContainer>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <Checkbox
            label="Show Chi-shape"
            checked={showChiShape}
            onChange={(event) => setShowChiShape(event.currentTarget.checked)}
          />
        </div>        
        <div style={{ marginBottom: '20px' }}>
          <Checkbox
            label="Show Delaunay triangulation"
            checked={showDelaunay}
            onChange={(event) => setShowDelaunay(event.currentTarget.checked)}
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <Checkbox
            label="Show darts"
            checked={showDarts}
            onChange={(event) => setShowDarts(event.currentTarget.checked)}
          />
        </div>        
        <h3>Chi Shape Computation</h3>
        {currentStep && (
          <div>
            <p>Type: {currentStep.type}</p>
            {(currentStep.type === 'skip' || currentStep.type === 'remove') && (
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
            
            {showChiShape && renderChiShape()}
            {renderCurrentEdge()}
            {showDelaunay && renderDelaunayEdges()}
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