import { Engine } from "./classes/engine";
import { Background } from "./game/background";
import { EnemyManager } from "./game/enemy-manager";
import { Player } from "./game/player";
import "./style.css";

const engine = new Engine();

engine.init().then(() => {
  const player = new Player(
    engine.InputManager,
    engine.bounds[0],
    engine.bounds[1],
  );

  const background = new Background(engine.bounds[0], engine.bounds[1]);

  const enemyManager = new EnemyManager(engine.bounds[0], engine.bounds[1]);

  engine.onUpdate = (dt) => {
    player.update(dt);
    background.update(dt);
    enemyManager.update(dt);
  };

  engine.onDraw = () => {
    background.draw(engine.spriteRenderer);
    player.draw(engine.spriteRenderer);
    enemyManager.draw(engine.spriteRenderer);
  };

  engine.draw();
});
