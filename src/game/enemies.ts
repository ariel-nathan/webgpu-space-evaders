import { Rect } from "../classes/rect";
import { SpriteRenderer } from "../classes/sprite-renderer";

export interface Enemy {
  active: boolean;
  drawRect: Rect;

  update(dt: number): void;
  draw(spriteRenderer: SpriteRenderer): void;
}
