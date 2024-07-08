import { Engine } from "./classes/engine";
import { Player } from "./game/player";
import "./style.css";

const engine = new Engine();

engine.init().then(() => {
  const player = new Player(
    engine.InputManager,
    engine.bounds[0],
    engine.bounds[1],
  );

  engine.onUpdate = (dt) => {
    player.update(dt);
  };

  engine.onDraw = () => {
    player.draw(engine.spriteRenderer);
  };

  engine.draw();
});
