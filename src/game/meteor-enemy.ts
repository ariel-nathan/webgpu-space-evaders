import { vec2 } from "gl-matrix";
import { Assets } from "../classes/assets";
import { Rect } from "../classes/rect";
import { SpriteRenderer } from "../classes/sprite-renderer";
import { Texture } from "../classes/texture";
import { Enemy } from "./enemies";

const METEOR_KEYS = [
  "meteorBrown_big1",
  "meteorBrown_big2",
  "meteorBrown_big3",
  "meteorBrown_big4",
  "meteorBrown_med1",
  "meteorBrown_med3",
  "meteorGrey_big1",
  "meteorGrey_big2",
  "meteorGrey_big3",
  "meteorGrey_big4",
  "meteorGrey_med1",
  "meteorGrey_med2",
];

const METEOR_MIN_SPEED = 0.05;
const METEOR_MAX_SPEED = 0.25;

export class MeteorEnemy implements Enemy {
  public active: boolean = true;
  private texture: Texture;
  public drawRect: Rect;
  private sourceRect: Rect;
  private speed: number = 0;
  private rotation: number = 0;
  private rotationSpeed: number = 0;
  private rotationOrigin: vec2 = vec2.fromValues(0.5, 0.5);

  constructor(
    private gameWidth: number,
    private gameHeight: number,
  ) {
    const key = METEOR_KEYS[Math.floor(Math.random() * METEOR_KEYS.length)];

    const meteorSprite = Assets.sprites[key];
    this.texture = meteorSprite.texture;
    this.sourceRect = meteorSprite.sourceRect.copy();
    this.drawRect = meteorSprite.drawRect.copy();

    this.speed =
      Math.random() * (METEOR_MAX_SPEED - METEOR_MIN_SPEED) + METEOR_MIN_SPEED;

    this.rotationSpeed = (Math.random() - 0.5) * 0.005;
  }

  update(dt: number): void {
    this.drawRect.y += this.speed * dt;
    this.rotation += this.rotationSpeed * dt;
  }

  draw(spriteRenderer: SpriteRenderer): void {
    spriteRenderer.drawSpriteSource(
      this.texture,
      this.drawRect,
      this.sourceRect,
      undefined,
      this.rotation,
      this.rotationOrigin,
    );
  }
}
