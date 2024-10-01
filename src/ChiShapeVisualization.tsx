import React, { useState, useEffect, useMemo, useRef } from 'react';
import styled from '@emotion/styled';
import { Vector } from './math/vector';
import { ChiShapeComputer, ComputationStep} from './math/ChiShapeComputer';
import { Dart } from './math/CombinatorialMap';
import { Vertex } from './viz/Vertex';
import SliderControl from './ui/SliderControl';
import { Slider, Checkbox, Popover, Text } from '@mantine/core';
import Colors from './Colors';
import ChecklistStep from './ui/ChecklistStep';
import ColorLabel from './ui/ColorLabel';
import { arrayIntersect, titleCase } from './utils';
import EdgeSymbol from './ui/EdgeSymbol';
import Polygon from './viz/Polygon';
import DelaunayTriangulation from './viz/DelaunayTriangulation';
import Darts from './viz/Darts';
import RegularityModal from './modals/RegularityModal';
import OverviewModal from './modals/OverviewModal';
import { CircleHelp } from 'lucide-react';

const Container = styled.div`
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  font-family: "Varela Round", sans-serif;
  font-weight: 400;
  font-style: normal;  
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
  display: flex;i
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
  line-height: 27px;
  font-size: 14px;
  font-weight: bold;
  flex-shrink: 0;
  margin-right: 15px;
`

const LambdaValue = styled.div`
  margin-left: 10px;
  width: 35px;
  flex-shrink: 0;
`

const ModalButton = styled.span`
  background-color: unset;
  border: none;
  border-bottom: 1px dotted black;
  margin-left: 6px;
  cursor: pointer;
`

const AppTitle = styled.div`
  text-align: center;
  font-size: 24px;
  margin-top: 15px;
  display: flex;
  justify-content: center;
  gap: 10px;
  align-items: center;
`

const AlgorithmOverviewIcon = styled(CircleHelp)`
  color: gray;
  width: 24px;
  cursor: pointer;
  &:hover {
    color: black;
  }
`

const ChiShapeVisualization: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  const [points, setPoints] = useState<Vector[]>([]);
  const [lambda, setLambda] = useState(.15);
  const [hoveredDart, setHoveredDart] = useState<Dart | null>(null);
  const [stepIndex, setStepIndex] = useState<number>(0);

  const [showDarts, setShowDarts] = useState(false);
  const [showDelaunay, setShowDelaunay] = useState(true);  
  const [showChiShape, setShowChiShape] = useState(true);

  const steps = useMemo(() => new ChiShapeComputer(points, lambda).getComputationSteps(), [points, lambda]);
  const currentStep: ComputationStep = useMemo(() => steps[stepIndex], [steps, stepIndex]);
  const chiShapeComputer = useMemo(() => new ChiShapeComputer(points, lambda), [points, lambda])
  const combinatorialMap = useMemo(() => chiShapeComputer.getCombinatorialMap(), [chiShapeComputer])

  const [showRegularityModal, setShowRegularityModal] = useState(false)
  const [showOverviewModal, setShowOverviewModal] = useState(false)
  const [showLambdaPopover, setShowLambdaPopover] = useState(false)

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

  const removePoint = (point: Vector) => {
    setPoints(prevPoints => {
      const existingPointIndex = prevPoints.findIndex(p => p === point);
      
      if (existingPointIndex !== -1) {
        return prevPoints.filter((_, index) => index !== existingPointIndex);
      }
      return prevPoints;
    });
  }

  

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

  const renderCurrentStep = () => {
    if (!currentStep || !currentStep.edge) return null;
  
    const { d1, d2 } = currentStep.edge;
    const start = points[d1.origin];
    const end = points[d2.origin];
  
    return (
      <>
        {currentStep.newEdges?.map(edge => {
          const s = points[edge.d1.origin]
          const e = points[edge.d2.origin]
          return <line
            x1={s.x}
            y1={s.y}
            x2={e.x}
            y2={e.y}
            stroke={Colors.lightGreen}
            strokeWidth={10}
          />
        })}      
        <line
          x1={start.x}
          y1={start.y}
          x2={end.x}
          y2={end.y}
          stroke={currentStep.type == 'remove' ? Colors.lightRed : Colors.lightYellow}
          strokeWidth={10}
        />
      </>
    );
  };

  const renderPoints = () => {
    return points.map((point, index) => {
      const isHighlighted = (index == currentStep?.edge?.d1.origin || index == currentStep?.edge?.d2.origin)
    
      const color = currentStep?.type == 'remove' ? Colors.red : Colors.yellow
      const strokeColor = currentStep?.type == 'remove' ? Colors.lightRed : Colors.lightYellow

      const vertices = currentStep?.newEdges?.map(e => [e.d1.origin, e.d2.origin])
      let revealedVertex = undefined
      if (vertices) {
        const intersect = arrayIntersect(vertices[0], vertices[1]);
        revealedVertex = intersect[0]
      }
      return <Vertex
        key={`point-${index}`}
        point={point}
        index={index}
        color={isHighlighted ? color : (revealedVertex == index ? Colors.green : undefined)}
        strokeColor={isHighlighted ? strokeColor : (revealedVertex == index ? Colors.lightGreen : undefined)}
        textColor='white'
        onClick={() => removePoint(point)}
      />
    });
  };


  return (
    <Container>
      <RegularityModal opened={showRegularityModal} onClose={() => setShowRegularityModal(false)}/>
      <OverviewModal opened={showOverviewModal} onClose={() => setShowOverviewModal(false)}/>
      <InfoPanel>
        <div style={{ marginBottom: '20px' }}>
          
          <LambdaSliderContainer>
            <Popover withArrow shadow='md' opened={showLambdaPopover}>
              <Popover.Target>
                <LambdaIcon 
                onMouseEnter={() => setShowLambdaPopover(true)}
                onMouseLeave={() => setShowLambdaPopover(false)}>
                  <span>λ<sub>p</sub></span>
                </LambdaIcon>
              </Popover.Target>
              <Popover.Dropdown>
                <Text size="sm">
                  <span>λ<sub>p</sub></span> controls the length threshold used to determine
                  which edges to remove. 
                  <br/>
                  <span>λ<sub>p</sub></span> = 0 means that all edges that can be removed
                  will be.
                  <br/>
                  <span>λ<sub>p</sub></span> = 1 means no edges will be removed.
                </Text>
              </Popover.Dropdown>
            </Popover>
            
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
        <h3>Step {stepIndex+1} / {steps.length}</h3>
        {currentStep && currentStep.type == 'init' && (
          <div>
            <h4>Initialization</h4>
            Before running our algorithm, we must:
            <ul>
              <li>find the Delaunay triangulation</li>
              <li>find the border of the triangulation. This is our initial "chi-shape" from which 
              we will carve away to arrive at the final shape.</li>
            </ul>
          </div>
        )}
        {currentStep && (
          <div>
            {(currentStep.type === 'skip' || currentStep.type === 'remove') && currentStep.edge && (
              <>
                <ChecklistStep checked={currentStep.edge.length >= chiShapeComputer.getLengthThreshold()}>
                  Length {currentStep.edge.length.toFixed(2)} {'>'} Threshold ({chiShapeComputer.getLengthThreshold().toFixed(2)})
                </ChecklistStep>
                <ChecklistStep checked={currentStep.isRegular ?? false}>
                  Is 
                  <ModalButton onClick={() => setShowRegularityModal(true)}>Regular</ModalButton>
                </ChecklistStep>              
                <p>
                  <ColorLabel backgroundColor={currentStep.type == 'skip' ? Colors.lightYellow : Colors.lightRed}>{titleCase(currentStep.type)}</ColorLabel>
                  edge
                  <EdgeSymbol vertex1={currentStep.edge.d1.origin} vertex2={currentStep.edge.d2.origin}/>
                </p>
                <div>
                {currentStep.newEdges?.map(edge => (
                  <p>
                    <ColorLabel backgroundColor={Colors.lightGreen}>Add</ColorLabel>
                    edge
                    <EdgeSymbol vertex1={edge.d1.origin} vertex2={edge.d2.origin}/>
                  </p>
                  ))}                  
                </div>
              </>
            )}
          </div>
        )}
        {getDartInfo()}
      </InfoPanel>
      <VisualizationContainer>
        <AppTitle>
          <div>Chi Shape Algorithm</div>
          <AlgorithmOverviewIcon onClick={() => setShowOverviewModal(true)}/>
        </AppTitle>
        <SVGContainer>
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            onClick={handleSvgClick}
          >
            {showChiShape && currentStep?.currentChiShape && 
              <Polygon
                points={Array.from(currentStep.currentChiShape.values()).map(e => new Vector(points[e.d1.origin].x, points[e.d1.origin].y))}
                fill={Colors.lightPurple}
                stroke={Colors.purple}
                strokeWidth={10}
              />
            }
            {renderCurrentStep()}
            {showDelaunay && 
              <DelaunayTriangulation combinatorialMap={combinatorialMap} points={points}/>
            }
            {showDarts && 
              <Darts combinatorialMap={combinatorialMap} points={points} hoveredDart={hoveredDart} setHoveredDart={setHoveredDart}/>
            }
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