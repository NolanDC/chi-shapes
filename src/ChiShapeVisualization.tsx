import React, { useState, useEffect, useMemo, useRef } from 'react';
import styled from '@emotion/styled';
import { Vector } from './math/vector';
import { ChiShapeComputer, ComputationStep} from './math/ChiShapeComputer';
import { Dart } from './math/CombinatorialMap';
import { Vertex } from './viz/Vertex';
import SliderControl from './ui/SliderControl';
import { Checkbox } from '@mantine/core';
import Colors from './Colors';
import ChecklistStep from './ui/ChecklistStep';
import ColorLabel from './ui/ColorLabel';
import { arrayIntersect, arrayUnique, titleCase } from './utils';
import EdgeSymbol from './ui/EdgeSymbol';
import Polygon from './viz/Polygon';
import DelaunayTriangulation from './viz/DelaunayTriangulation';
import Darts from './viz/Darts';
import RegularityModal from './modals/RegularityModal';
import OverviewModal from './modals/OverviewModal';
import { CircleHelp } from 'lucide-react';
import { TriangleView } from './viz/TriangleView';
import BoundaryModal from './modals/BoundaryModal';
import { jitteredGridPoints } from './generatePoints';
import { LambdaSlider } from './ui/LambdaSlider';

const Container = styled.div`
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: auto;
  font-family: "Varela Round", sans-serif;
  font-weight: 400;
  font-style: normal;

  @media (max-width: 768px) {
    flex-direction: column;
    min-height: 100vh;
  }
`;

const InfoPanel = styled.div`
  width: 350px;
  padding: 30px;
  @media (max-width: 768px) {
    order: 2;
    width: 100%;
  }
`;

const VisualizationContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  @media (max-width: 768px) {
    height: 80vh;
    flex-shrink: 0;
  }
`;

const SVGContainer = styled.div`
  position: relative;
  flex: 1;
  @media (max-width: 768px) {
    flex-basis: 60vh;
    flex-grow 1;
    flex-shrink: 0;
  }  
`;



const ModalButton = styled.span`
  background-color: unset;
  border: none;
  border-bottom: 1px dotted black;
  margin-left: 4px;
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

const InstructionsText = styled.div`
  font-style: italic;
  color: #aaa;
  text-align: center;
`
const AlgorithmOverviewIcon = styled(CircleHelp)`
  color: gray;
  width: 24px;
  cursor: pointer;
  &:hover {
    color: black;
  }
`

const ChiShapeVisualization = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  const [points, setPoints] = useState<Vector[]>([]);
  const [lambda, setLambda] = useState(0);
  const [selectedDart, setSelectedDart] = useState<Dart | null>(null);
  const [stepIndex, setStepIndex] = useState<number>(0);

  const [showDarts, setShowDarts] = useState(false);
  const [showDelaunay, setShowDelaunay] = useState(true);  
  const [showChiShape, setShowChiShape] = useState(true);

  useEffect(() => {
    setSelectedDart(null)
  }, [points])

  const steps = useMemo(() => new ChiShapeComputer(points, lambda).getComputationSteps(), [points, lambda]);
  const currentStep: ComputationStep = useMemo(() => steps[stepIndex], [steps, stepIndex]);
  const chiShapeComputer = useMemo(() => new ChiShapeComputer(points, lambda), [points, lambda])
  const combinatorialMap = useMemo(() => chiShapeComputer.getCombinatorialMap(), [chiShapeComputer])

  const [showRegularityModal, setShowRegularityModal] = useState(false)
  const [showOverviewModal, setShowOverviewModal] = useState(false)
  const [showBoundaryModal, setShowBoundaryModal] = useState(false)

  useEffect(() => {
    if (steps.length > 0) {
      setStepIndex(steps.length - 1)
    }
  }, [points, lambda]);

  useEffect(() => {
    setSelectedDart(null)
  }, [chiShapeComputer])

  useEffect(() => {
    if (!svgRef.current) return
    setPoints(jitteredGridPoints(10, svgRef))
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
    setSelectedDart(null)
    setPoints(prevPoints => {
        return [...prevPoints, clickedPoint];
    });
  };

  const removePoint = (point: Vector) => { 
    setSelectedDart(null)
    setPoints(prevPoints => {
      const existingPointIndex = prevPoints.findIndex(p => p === point);
      
      if (existingPointIndex !== -1) {
        return prevPoints.filter((_, index) => index !== existingPointIndex);
      }
      return prevPoints;
    });
  }

  const renderCurrentStep = () => {
    if (!currentStep || !currentStep.edge) return null;
  
    const { d1, d2 } = currentStep.edge;
    const start = points[d1.origin];
    const end = points[d2.origin];
  
    const allPoints = [
      points[d1.origin],
      points[d2.origin],
    ]

    if (currentStep.newEdges) {
      currentStep.newEdges.forEach(edge => {
        allPoints.push(
          points[edge.d1.origin],
          points[edge.d2.origin]
        )
      });
    }

    const triPoints = arrayUnique(allPoints) as [Vector, Vector, Vector]
    return (
      <>
        {currentStep.type == 'remove' && (
          <TriangleView 
            points={triPoints}
            stroke='none'
            fill={Colors.lighterRed}
            strokeWidth={2}
            />
          )}

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
      <BoundaryModal opened={showBoundaryModal} onClose={() => setShowBoundaryModal(false)}/>
      <InfoPanel>
        <div style={{ marginBottom: '18px' }}>
          <LambdaSlider lambda={lambda} setLambda={setLambda}/>
        </div>
        <div style={{ marginBottom: '18px' }}>
          <Checkbox
            label="Show Chi-shape"
            checked={showChiShape}
            onChange={(event) => setShowChiShape(event.currentTarget.checked)}
          />
        </div>        
        <div style={{ marginBottom: '18px' }}>
          <Checkbox
            label="Show Delaunay triangulation"
            checked={showDelaunay}
            onChange={(event) => setShowDelaunay(event.currentTarget.checked)}
          />
        </div>
        <div style={{ marginBottom: '18px' }}>
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
                <ChecklistStep checked={currentStep.isBoundary ?? false}>
                  Is<ModalButton onClick={() => setShowBoundaryModal(true)}>Boundary Edge</ModalButton>
                </ChecklistStep>              
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
      </InfoPanel>
      <VisualizationContainer>
        <AppTitle>
          <div>Chi Shape Algorithm</div>
          <AlgorithmOverviewIcon onClick={() => setShowOverviewModal(true)}/>
        </AppTitle>
        <InstructionsText>click to add / remove points</InstructionsText>
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
              <Darts combinatorialMap={combinatorialMap} points={points} selectedDart={selectedDart} setSelectedDart={setSelectedDart}/>
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
