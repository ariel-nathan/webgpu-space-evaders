export class QuadGeometry {
  public vertices: Float32Array;
  public indices: Uint16Array;

  constructor() {
    // prettier-ignore
    this.vertices = new Float32Array([
      // x, y        u, v         r, g, b
      -0.5, -0.5,    0.0, 1.0,    1.0, 1.0, 1.0,
      0.5, -0.5,     1.0, 1.0,    1.0, 1.0, 1.0,
      -0.5, 0.5,     0.0, 0.0,    1.0, 1.0, 1.0,
      0.5, 0.5,      1.0, 0.0,    1.0, 1.0, 1.0,
    ]);

    // prettier-ignore
    this.indices = new Uint16Array([
      0, 1, 2,
      1, 2, 3,
    ]);
  }
}
