import { Vector } from '../math/vector';
import { CombinatorialMap, Dart } from '../math/CombinatorialMap';
import { DartView } from './DartView';
import Colors from '../Colors';

interface DartsProps {
  combinatorialMap: CombinatorialMap;
  points: Vector[];
  selectedDart: Dart | null;
  setSelectedDart: (dart: Dart | null) => void;
}

function Darts({ combinatorialMap, points, selectedDart, setSelectedDart }: DartsProps) {
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

        const hoveredTheta0 = selectedDart && combinatorialMap.t0(selectedDart) === dart;
        const hoveredTheta1 = selectedDart && combinatorialMap.t1(selectedDart) === dart;

        return (
          <DartView
            key={`dart-${dart.index}`}
            dart={dart}
            start={start}
            end={end}
            theta1End={theta1Dart ? points[theta1Dart.next] : null}
            isSelected={selectedDart === dart}
            highlight={(hoveredTheta0 || hoveredTheta1) ? Colors.darkGray : ''}
            onClick={() => setSelectedDart(dart)}
            renderThetaOperations={true}
          />
        );
      })}
    </>
  );
}

export default Darts;