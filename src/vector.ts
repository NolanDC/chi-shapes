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

  dist(v: Vector): number {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}