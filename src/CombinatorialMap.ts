import { Vector } from './vector';

export interface Dart {
  index: number;
  origin: number;
  face: number;
  next: number;
  removed?: boolean;
}

export class CombinatorialMap {
  darts: Dart[] = [];
  theta0: Map<Dart, Dart> = new Map();
  theta1: Map<Dart, Dart> = new Map();
  dartMap: Map<string, Dart> = new Map();

  constructor(triangles?: Uint32Array) {
    if (triangles && triangles.length > 0) {
      this.buildFromTriangles(triangles);
    }
  }

  private buildFromTriangles(triangles: Uint32Array) {
    
    for (let i = 0; i < triangles.length; i += 3) {
      const face = i / 3;
      const [a, b, c] = [triangles[i], triangles[i + 1], triangles[i + 2]];

      const d1 = this.addDart(a, face, b);
      const d2 = this.addDart(b, face, c);
      const d3 = this.addDart(c, face, a);
      const d4 = this.addDart(b, face, a);
      const d5 = this.addDart(c, face, b);
      const d6 = this.addDart(a, face, c);

      this.setTheta0(d1, d4);
      this.setTheta0(d2, d5);
      this.setTheta0(d3, d6);
      //console.log('-------------------')
      //console.log('1 to 6')
      this.linkDarts(d1, d6);
      //console.log('2 to 4')
      this.linkDarts(d2, d4);
      //console.log('3 to 5')
      this.linkDarts(d3, d5);
    }
    console.log('done rebuilding');
  }

  addDart(origin: number, face: number, next: number): Dart {
    const key = `${origin}-${next}`;
    if (this.dartMap.has(key)) {
      return this.dartMap.get(key)!;
    }
    const dart: Dart = { index: this.darts.length, origin, face, next };
    this.darts.push(dart);
    this.dartMap.set(key, dart);
    return dart;
  }

  setTheta0(d1: Dart, d2: Dart) {
    this.theta0.set(d1, d2);
    this.theta0.set(d2, d1);
  }

  setTheta1(d1: Dart, d2: Dart) {
    //console.log('setting theta1 for ', d1.index, ' to ', d2.index)
    this.theta1.set(d1, d2);
  }

  linkDarts(d1: Dart, d2: Dart) {
    if (!this.theta1.has(d1) && !this.theta1.has(d2)) {
      console.log('completely new link from ', d1.index, ' to ', d2.index, ' and back')
      this.setTheta1(d1, d2);
      this.setTheta1(d2, d1);
    } else if (this.theta1.has(d1) && !this.theta1.has(d2)) {
      const next = this.t1(d1, false)!;
      console.log('post inserting ', d2.index, ' between ', d1.index, ' and ', next.index)
      this.setTheta1(d1, d2);
      this.setTheta1(d2, next);
    } else if (!this.theta1.has(d1) && this.theta1.has(d2)) {
      let prev = d2;

      const seenDarts = new Set<Dart>();
      let failed = false
      //console.log('gonna loop');
      // TODO: Infinite loop here!
      while (this.t1(prev, false) !== d2) {
        prev = this.t1(prev, false)!;
        console.log('prev', prev);
  
        if (seenDarts.has(prev)) {
          console.error('Infinite loop detected in theta1 traversal');
          console.log('dart to attach:', d1);
          console.log('Target dart (d2):', d2);
          console.log('prev dart:', prev);
          
          console.log('Theta1 map:', this.theta1);
          console.log('All darts:', this.darts);
          console.log('Seen darts:', Array.from(seenDarts));
          failed = true
          break;
        }
  
        seenDarts.add(prev);
      }
     // console.log('done looping');

      //prev {index: 18, origin: 14, face: 3, next: 13}
      //prev {index: 16, origin: 14, face: 3, next: 9}
      console.log('prev inserting ', d1.index, ' between ', prev.index, ' and ', d2.index)

      if (!failed) {
        this.setTheta1(prev, d1);
        this.setTheta1(d1, d2);
      }

    } else {

      // TODO: Figure this out, what exactly is happening here?
      // Seems like this is kind of like a "correction" as two existing darts are encountered in a new triangle.  Previously 
      // d1 would be pointing to it's clockwise counterpart, and this corrects it since with the addition of the new 
      // dart d2, it's no longer clockwise. There's no need to change d2's theta1 since it's already set properly to d1
      console.log('doing something to  ', d1.index, ' and ', d2.index, ' not sure what tho')
      const next1 = this.t1(d1, false)!;
      console.log('theta1 of ', d1.index, 'is ', next1.index)
      
      
      const next2 = this.t1(d2, false)!;
      console.log('theta1 of d2', d2.index, 'is ', next2.index)
      this.setTheta1(d1, d2)
      //this.setTheta1(d1, next1);
      //this.setTheta1(d2, next2);
    }
  }

  boundaryEdgeInfo(d1: Dart, d2: Dart) {
    if (!d1 || !d2 || d1.removed || d2.removed) return

    const compose = (f: (x: Dart) => Dart, g: (x: Dart) => Dart) => (x: Dart) => f(g(x));
    const theta0 = (x: Dart) => this.t0(x) ?? x;
    const theta1 = (x: Dart) => this.t1(x) ?? x;
    
    const composition = compose(theta1, compose(theta0, compose(theta1, compose(theta0, compose(theta1, theta0)))));

    return {
      d1: composition(d1),
      d2: composition(d2),
      d1alt: theta1(theta0(theta1(theta0(theta1(theta0(d1)))))),
      d2alt: theta1(theta0(theta1(theta0(theta1(theta0(d2))))))
    }
  }

  isBoundaryEdge(d1: Dart, d2: Dart): boolean {
    if (!d1 || !d2 || d1.removed || d2.removed) return false

    const compose = (f: (x: Dart) => Dart, g: (x: Dart) => Dart) => (x: Dart) => f(g(x));
    const theta0 = (x: Dart) => this.t0(x) ?? x;
    const theta1 = (x: Dart) => this.t1(x) ?? x;
    
    const composition = compose(theta1, compose(theta0, compose(theta1, compose(theta0, compose(theta1, theta0)))));
    
    return !(theta1(theta0(theta1(theta0(theta1(theta0(d1)))))) === d1 && theta1(theta0(theta1(theta0(theta1(theta0(d2)))))) === d2);
  }

  t1(d: Dart, r: boolean = true): Dart {
    let result = this.theta1.get(d);
    
    if (r) {
      while (result && result.removed) {
        result = this.theta1.get(result);
      }
    }


    return result ?? d;
  }

  t0(d: Dart): Dart {
    let result = this.theta0.get(d);

    return result ?? d;
  }

  reveal(d: Dart): Dart {
    //console.log('theta1', this.theta1)

    if (this.t0(this.t1(this.t0(this.t1(this.t0(this.t1(d)))))) === d) {
      return this.t1(d);
    } else {
      return this.t0(this.t1(this.t0(this.t1(this.t0(d)))));
    }
  }

  isBoundaryVertex(vertexIndex: number): boolean {
    const dart = this.darts.find(d => d.origin === vertexIndex && !d.removed);
    if (!dart) return false;
    
    let current = dart;
    do {
      if (this.isBoundaryEdge(current, this.theta0.get(current)!)) {
        return true;
      }
      current = this.t1(this.t1(current)!)!;
    } while (current !== dart);
    
    return false;
  }

  isRegularRemoval(d1: Dart, d2: Dart): boolean {
    if (!this.isBoundaryEdge(d1, d2)) {
      return false;
    }

    const revealedDart = this.reveal(d1);
    const exposedVertex = this.theta0.get(revealedDart)!.origin;
    return !this.isBoundaryVertex(exposedVertex);
  }

  removeEdge(d1: Dart, d2: Dart) {
    const r1 = this.reveal(d1);
    const r2 = this.reveal(d2);

    // Do we need this? It seems wrong...
    //this.setTheta1(this.theta1.get(d1)!, r2);
    //this.setTheta1(this.theta1.get(d2)!, r1);
    /*
    if (this.theta1.get(r1) === d1) {
      console.log('filling hole')
      this.theta1.set(r1, this.theta1.get(d1)!)
    }
    if (this.theta1.get(r2) === d2) {
      console.log('filling hole')
      this.theta1.set(r2, this.theta1.get(d2  )!)
    }
      */

    //this.theta0.delete(d1);
    //this.theta0.delete(d2);
    //this.theta1.delete(d1);
    //this.theta1.delete(d2);

    d1.removed = true;
    d2.removed = true;

    this.dartMap.delete(`${d1.origin}-${d1.next}`);
    this.dartMap.delete(`${d2.origin}-${d2.next}`);
  }

  revealedEdges(d1: Dart, d2: Dart): [Dart, Dart] {
    return [this.reveal(d1), this.reveal(d2)];
  }
}