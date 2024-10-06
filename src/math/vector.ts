export class Vector {
  constructor(public x: number, public y: number) {}

  add(v: Vector): Vector {
    return new Vector(this.x + v.x, this.y + v.y)
  }

  sub(v: Vector): Vector {
    return new Vector(this.x - v.x, this.y - v.y)
  }

  scale(n: number): Vector {
    return new Vector(this.x * n, this.y * n)
  }

  div(n: number): Vector {
    return new Vector(this.x / n, this.y / n)
  }

  mag(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  setMag(n: number): void {
    const m = this.mag();
    if (m !== 0) {
      this.scale(n / m);
    }
  }

  limit(max: number): void {
    if (this.mag() > max) {
      this.setMag(max);
    }
  }

  dist(v: Vector): number {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  normalize(): Vector {
    return this.div(this.mag())
  }
}