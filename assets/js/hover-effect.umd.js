class Vec2 {
  constructor() {
    this.pi = Math.PI;
    this.pi2 = this.pi * 2;
  }

  add(p1, p2) {
    const x = p1.x + p2.x;
    const y = p1.y + p2.y;
    return this.set(x, y);
  }

  sub(p1, p2) {
    const x = p1.x - p2.x;
    const y = p1.y - p2.y;
    return this.set(x, y);
  }

  div(p1, p2) {
    const x = p1.x / p2.x;
    const y = p1.y / p2.y;
    return this.set(x, y);
  }

  mul(p1, p2) {
    const x = p1.x * p2.x;
    const y = p1.y * p2.y;
    return this.set(x, y);
  }

  dist(p1, p2) {
    const { x, y } = this.sub(p1, p2);
    return Math.hypot(x, y);
  }

  radToDeg(rad) {
    return rad * 180 / this.pi;
  }

  degToRad(deg) {
    return deg * this.pi / 180;
  }

  angle(p1, p2) {
    const { x, y } = this.sub(p1, p2);
    return Math.atan2(y, x);
  }

  scale(p, n) {
    const x = p.x * n;
    const y = p.y * n;
    return this.set(x, y);
  }

  lerp(l, c, t) {
    const v = t * (c - l) + l;
    return v;
  }

  dot(p1, p2) {
    return p1.x * p2.x + p1.y * p2.y;
  }

  cross(p1, p2) {
    const z = p1.x * p2.x - p1.y * p2.y;
    return this.set(0, 0, z);
  }

  rot2d(p1, p2, a) {
    const { x, y } = this.sub(p1, p2);
    const sin = Math.sin(a);
    const cos = Math.cos(a);

    const rotX = x * cos - y * sin + p2.x;
    const rotY = x * sin - y * cos + p2.y;

    return this.set(rotX, rotY);
  }

  length(p) {
    return Math.sqrt(p.x * p.x + p.y * p.y);
  }

  norm(p) {
    const { x, y } = p;
    let len = x * x + y * y;

    if (len > 0) len = 1 / Math.sqrt(len);

    const out1 = x * len;
    const out2 = y * len;

    return this.set(out1, out2);
  }

  clamp(v, min, max) {
    return Math.max(min, Math.min(v, max));
  }

  map(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
  }

  set(x = 0, y = 0, z = 0) {
    return { x, y, z };
  }
}