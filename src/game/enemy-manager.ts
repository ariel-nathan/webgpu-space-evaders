import { SpriteRenderer } from "../classes/sprite-renderer";
import { Enemy } from "./enemies";
import { MeteorEnemy } from "./meteor-enemy";

const SPAWN_INTERVAL = 1000;

export class EnemyManager {
  private timeToSpawn: number = 0;
  private pool: Enemy[] = [];

  constructor(
    private gameWidth: number,
    private gameHeight: number,
  ) {}

  public spawnEnemy() {
    if (this.timeToSpawn > SPAWN_INTERVAL) {
      this.timeToSpawn = 0;
      let enemy = this.pool.find((enemy) => !enemy.active);
      if (!enemy) {
        enemy = new MeteorEnemy(this.gameWidth, this.gameHeight);
        this.pool.push(enemy);
      }

      enemy.active = true;
      enemy.drawRect.x = Math.random() * (this.gameWidth - enemy.drawRect.w);
      enemy.drawRect.y = -enemy.drawRect.h;
    }
  }

  public update(dt: number) {
    this.timeToSpawn += dt;

    this.spawnEnemy();

    for (const enemy of this.pool) {
      if (enemy.active) {
        enemy.update(dt);

        if (enemy.drawRect.y > this.gameHeight) {
          enemy.active = false;
        }
      }
    }
  }

  public draw(spriteRenderer: SpriteRenderer) {
    for (const enemy of this.pool) {
      if (enemy.active) {
        enemy.draw(spriteRenderer);
      }
    }
  }
}
