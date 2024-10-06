import { Vector } from '../math/vector';
import { CombinatorialMap, Dart } from '../math/CombinatorialMap';
import { DartView } from './DartView';

interface DartsProps {
  combinatorialMap: CombinatorialMap;
  points: Vector[];
  hoveredDart: Dart | null;
  setHoveredDart: (dart: Dart | null) => void;
}

function Darts({ combinatorialMap, points, hoveredDart, setHoveredDart }: DartsProps) {
  return (
    <>
      {combinatorialMap.darts.map((dart) => {
        const start = points[dart.origin];
        const end = points[dart.next];
        
        if (!start || !end) {
          console.warn(`Invalid dart: ${dart.index}, origin: ${dart.origin}, next: ${dart.next}`);
          return null;
        }

        const theta1Dart = combinatorialMap.t1(dart);
        let theta1End = null;
        if (theta1Dart) {
          const theta1Start = points[theta1Dart.origin];
          const theta1Next = points[theta1Dart.next];
          if (theta1Start && theta1Next) {
            theta1End = new Vector(
              theta1Start.x + (theta1Next.x - theta1Start.x) * 0.3,
              theta1Start.y + (theta1Next.y - theta1Start.y) * 0.3
            );
          }
        }

        const hoveredTheta0 = hoveredDart && combinatorialMap.t0(hoveredDart) === dart;
        const hoveredTheta1 = hoveredDart && combinatorialMap.t1(hoveredDart) === dart;

        return (
          <DartView
            key={`dart-${dart.index}`}
            dart={dart}
            start={start}
            end={end}
            theta1End={theta1Dart ? points[theta1Dart.next] : null}
            isHovered={hoveredDart === dart}
            highlight={hoveredTheta0 ? 'green' : (hoveredTheta1 ? 'blue' : '')}
            onMouseEnter={() => setHoveredDart(dart)}
            onMouseLeave={() => setHoveredDart(null)}
          />
        );
      })}
    </>
  );
}

export default Darts;