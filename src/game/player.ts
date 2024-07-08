import { vec2 } from "gl-matrix";
import { Assets } from "../classes/assets";
import { Rect } from "../classes/rect";
import { SpriteRenderer } from "../classes/sprite-renderer";
import { Texture } from "../classes/texture";
import { InputManager } from "./input-manager";

const PLAYER_SPEED = 0.25;

export class Player {
  private movementDirection = vec2.create();
  private drawRect: Rect;
  private sourceRect: Rect;
  private texture: Texture;

  constructor(
    private inputManager: InputManager,
    private gameWidth: number,
    private gameHeight: number,
  ) {
    const playerSprite = Assets.sprites["playerShip1_blue"];
    this.drawRect = playerSprite.drawRect.copy();
    this.sourceRect = playerSprite.sourceRect.copy();
    this.texture = playerSprite.texture;
  }

  public clamp() {
    if (this.drawRect.x < 0) {
      this.drawRect.x = 0;
    } else if (this.drawRect.x + this.drawRect.w > this.gameWidth) {
      this.drawRect.x = this.gameWidth - this.drawRect.w;
    }

    if (this.drawRect.y < 0) {
      this.drawRect.y = 0;
    } else if (this.drawRect.y + this.drawRect.h > this.gameHeight) {
      this.drawRect.y = this.gameHeight - this.drawRect.h;
    }
  }

  public update(dt: number) {
    this.movementDirection[0] = 0;
    this.movementDirection[1] = 0;

    // x direction
    if (this.inputManager.isKeyDown("ArrowLeft")) {
      this.movementDirection[0] = -1;
    } else if (this.inputManager.isKeyDown("ArrowRight")) {
      this.movementDirection[0] = 1;
    }

    // y direction
    if (this.inputManager.isKeyDown("ArrowUp")) {
      this.movementDirection[1] = -1;
    } else if (this.inputManager.isKeyDown("ArrowDown")) {
      this.movementDirection[1] = 1;
    }

    vec2.normalize(this.movementDirection, this.movementDirection);
    this.drawRect.x += this.movementDirection[0] * PLAYER_SPEED * dt;
    this.drawRect.y += this.movementDirection[1] * PLAYER_SPEED * dt;

    this.clamp();
  }

  public draw(spriteRenderer: SpriteRenderer) {
    spriteRenderer.drawSpriteSource(
      this.texture,
      this.drawRect,
      this.sourceRect,
      undefined,
      0,
    );
  }
}
