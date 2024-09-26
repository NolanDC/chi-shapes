export class Vector {
  constructor(public x: number, public y: number) {}

  add(v: Vector): void {
    this.x += v.x;
    this.y += v.y;
  }

  sub(v: Vector): void {
    this.x -= v.x;
    this.y -= v.y;
  }

  mult(n: number): void {
    this.x *= n;
    this.y *= n;
  }

  div(n: number): void {
    this.x /= n;
    this.y /= n;
  }

  mag(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  setMag(n: number): void {
    const m = this.mag();
    if (m !== 0) {
      this.mult(n / m);
    }
  }

  limit(max: number): void {
    if (this.mag() > max) {
      this.setMag(max);
    }
  }

  dot(other: Vector): number {
    return Vector.dot(this, other);
  }

  cross(other: Vector): number {
    return Vector.cross(this, other);
  }

  static dot(v1: Vector, v2: Vector): number {
    return v1.x * v2.x + v1.y * v2.y;
  }

  static cross(v1: Vector, v2: Vector): number {
    return v1.x * v2.y - v1.y * v2.x;
  }

  static dist(v1: Vector, v2: Vector): number {
    const dx = v1.x - v2.x;
    const dy = v1.y - v2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  static sub(v1: Vector, v2: Vector): Vector {
    return new Vector(v1.x - v2.x, v1.y - v2.y);
  }

  static add(v1: Vector, v2: Vector): Vector {
    return new Vector(v1.x + v2.x, v1.y + v2.y);
  }

  static random2D(): Vector {
    const angle = Math.random() * Math.PI * 2;
    return new Vector(Math.cos(angle), Math.sin(angle));
  }

  static lerp(v1: Vector, v2: Vector, t: number): Vector {
    return new Vector(
      v1.x + (v2.x - v1.x) * t,
      v1.y + (v2.y - v1.y) * t
    );
  }

  static scale = function(v: Vector, scalar: number): Vector {
    return new Vector(v.x * scalar, v.y * scalar);
  };  
}