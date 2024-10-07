import { Vector } from '../math/vector';
import { Line } from '../viz/Line';
import { Vertex } from '../viz/Vertex';
import { DartView } from '../viz/DartView';
import Polygon from '../viz/Polygon';
import Colors from '../Colors';
import styled from '@emotion/styled';
import { useMemo, useState } from 'react';
import { ChiShapeComputer } from '../math/ChiShapeComputer';
import DelaunayTriangulation from '../viz/DelaunayTriangulation';
import { CombinatorialMap, Dart } from '../math/CombinatorialMap';
import { ThetaOperation } from '../viz/ThetaOperation';

const FlexContainer = styled.div`
  display: flex;
  justify-content: space-evenly;
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SVGContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SVGTitle = styled.div`
  font-weight: 700;
  margin-top: 8px;
`;

const BoundaryEdgeSVGs = () => {
  const nonBoundaryPoints = useMemo(() => [
    new Vector(30, 30),
    new Vector(270, 30),
    new Vector(270, 270),
    new Vector(30, 270),
    new Vector(150, 150)
  ], []);

  const boundaryPoints = useMemo(() => [
    new Vector(30, 30),
    new Vector(270, 30),
    new Vector(270, 270),
    new Vector(30, 270)
  ], []);

  const nonBoundaryComputer = useMemo(() => new ChiShapeComputer(nonBoundaryPoints, 1), [nonBoundaryPoints]);
  const boundaryComputer = useMemo(() => new ChiShapeComputer(boundaryPoints, 1), [boundaryPoints]);

  const [selectedNonBoundaryDart, setSelectedNonBoundaryDart] = useState<Dart | null>(null);
  const [selectedBoundaryDart, setSelectedBoundaryDart] = useState<Dart | null>(null);

  const getWalkDarts = (combiMap: CombinatorialMap, startDart: Dart): Dart[] => {
    const walkDarts = [startDart];
    let currentDart = startDart;
    
    for (let i = 0; i < 5; i++) {
      currentDart = i % 2 === 0 ? combiMap.t1(currentDart) : combiMap.t0(currentDart);
      walkDarts.push(currentDart);
    }
    return walkDarts;
  };

  const renderDartsAndOperations = (points: Vector[], combiMap: CombinatorialMap, highlightedEdge: [number, number], selectedDart: Dart | null, setSelectedDart: React.Dispatch<React.SetStateAction<Dart | null>>) => {
    const edgeDarts = combiMap.darts.filter(dart => 
      (dart.origin === highlightedEdge[0] && dart.next === highlightedEdge[1]) || 
      (dart.origin === highlightedEdge[1] && dart.next === highlightedEdge[0])
    );

    const walkDarts = selectedDart ? getWalkDarts(combiMap, selectedDart) : [];

    const darts = combiMap.darts.map((dart, index) => {
      const isEdgeDart = edgeDarts.some(d => d.index === dart.index);
      const isWalkDart = walkDarts.some(d => d.index === dart.index);
      const shouldRender = isEdgeDart || isWalkDart;

      if (!shouldRender) return null;

      return (
        <DartView
          key={index}
          dart={dart}
          start={points[dart.origin]}
          end={points[dart.next]}
          theta1End={points[combiMap.t1(dart)?.next ?? dart.next]}
          isSelected={selectedDart?.index === dart.index}
          highlight={''} 
          color={isEdgeDart ? Colors.mediumGray : Colors.lightGray}
          onClick={isEdgeDart ? (() => setSelectedDart(dart)) : undefined}
          renderThetaOperations={false}
        />
      );
    });


    const thetaOperations = walkDarts.map((dart, index) => {
      if (index === walkDarts.length) return;
      const currentDart = walkDarts[index];
      const nextDart = walkDarts[(index + 1) % walkDarts.length];
      const isTheta1 = index % 2 === 0;
      const start = points[currentDart.origin];
      const end = points[currentDart.next];

      if (isTheta1) {
        // Render θ₁ operation
        const currentMidPoint = start.add(end.sub(start).scale(0.2));
        const nextMidPoint = points[nextDart.origin].add(points[nextDart.next].sub(points[nextDart.origin]).scale(0.2));
        const theta1Point = currentMidPoint.add(nextMidPoint.sub(currentMidPoint).scale(0.5));
        
        return (
          <>
            <ThetaOperation
              x={theta1Point.x}
              y={theta1Point.y}
              type="1"
            />
          </>
        );
      } else {
        // Render θ₀ operation
        const midPoint = start.add(end.sub(start).scale(0.5));
        return (
          <ThetaOperation
            x={midPoint.x}
            y={midPoint.y}
            type="0"
          />
        );
      }
    });

    return [...darts, ...thetaOperations];
  };

  return (
    <FlexContainer>
      <SVGContainer>
        <SVGTitle>Interior Edge</SVGTitle>
        <svg width={300} height={300}>
          <Polygon 
            points={nonBoundaryPoints.filter((_, i) => i !== 4)}
            fill={Colors.lightPurple}
            stroke={Colors.purple}
            strokeWidth={3}
          />
          <DelaunayTriangulation 
            combinatorialMap={nonBoundaryComputer.getCombinatorialMap()} 
            points={nonBoundaryPoints}
          />
          <Line
            start={nonBoundaryPoints[0]}
            end={nonBoundaryPoints[4]}
            stroke={Colors.lightYellow}
            strokeWidth={5}
          />
          {renderDartsAndOperations(nonBoundaryPoints, nonBoundaryComputer.getCombinatorialMap(), [0, 4], selectedNonBoundaryDart, setSelectedNonBoundaryDart)}
          {nonBoundaryPoints.map((point, index) => (
            <Vertex
              key={index}
              point={point}
              index={index}
              strokeColor={Colors.purple}
              textColor="white"
              interactive={false}
            />
          ))}
        </svg>
      </SVGContainer>
      <SVGContainer>
        <SVGTitle>Boundary Edge</SVGTitle>
        <svg width={300} height={300}>
          <Polygon 
            points={boundaryPoints}
            fill={Colors.lightPurple}
            stroke={Colors.purple}
            strokeWidth={3}
          />
          <DelaunayTriangulation 
            combinatorialMap={boundaryComputer.getCombinatorialMap()} 
            points={boundaryPoints}
          />
          <Line
            start={boundaryPoints[0]}
            end={boundaryPoints[1]}
            stroke={Colors.lightGreen}
            strokeWidth={5}
          />
          {renderDartsAndOperations(boundaryPoints, boundaryComputer.getCombinatorialMap(), [0, 1], selectedBoundaryDart, setSelectedBoundaryDart)}
          {boundaryPoints.map((point, index) => (
            <Vertex
              key={index}
              point={point}
              index={index}
              strokeColor={Colors.purple}
              textColor="white"
              interactive={false}
            />
          ))}
        </svg>
      </SVGContainer>
    </FlexContainer>
  );
};

export default BoundaryEdgeSVGs;