export class QuadGeometry {
  public positions: Float32Array;
  public colors: Float32Array;
  public texCoords: Float32Array;

  constructor() {
    // prettier-ignore
    this.positions = new Float32Array([
      -0.5, -0.5, // x, y
      0.5, -0.5,
      -0.5, 0.5,
      -0.5, 0.5,
      0.5, 0.5,
      0.5, -0.5,
    ]);

    // prettier-ignore
    this.colors = new Float32Array([
      1.0, 1.0, 1.0,  // r, g, b
      1.0, 1.0, 1.0, 
      1.0, 1.0, 1.0, 
      1.0, 1.0, 1.0, 
      1.0, 1.0, 1.0, 
      1.0, 1.0, 1.0, 
    ]);

    // prettier-ignore
    this.texCoords = new Float32Array([
      0.0, 1.0, // u, v
      1.0, 1.0,
      0.0, 0.0,
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0
    ]);
  }
}
