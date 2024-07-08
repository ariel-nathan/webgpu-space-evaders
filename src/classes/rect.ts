export class Rect {
  constructor(
    public x: number,
    public y: number,
    public w: number,
    public h: number,
  ) {}

  public copy(): Rect {
    return new Rect(this.x, this.y, this.w, this.h);
  }
}
