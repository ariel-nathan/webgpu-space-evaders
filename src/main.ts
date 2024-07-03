import { Renderer } from "./classes/renderer";
import "./style.css";

const renderer = new Renderer();

renderer.init().then(() => {
  renderer.draw();
});
