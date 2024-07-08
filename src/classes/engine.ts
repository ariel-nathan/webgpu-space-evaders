import { vec2 } from "gl-matrix";
import { InputManager } from "../game/input-manager";
import { Assets } from "./assets";
import { SpriteRenderer } from "./sprite-renderer";

export class Engine {
  private lastTime = 0;

  private canvas!: HTMLCanvasElement;
  private context!: GPUCanvasContext;
  private device!: GPUDevice;

  private passEncoder!: GPURenderPassEncoder;

  public spriteRenderer!: SpriteRenderer;

  public InputManager!: InputManager;

  public bounds = vec2.create();

  constructor() {}

  public onUpdate: (dt: number) => void = () => {};
  public onDraw: () => void = () => {};

  public async init() {
    this.canvas = document.getElementById("canvas") as HTMLCanvasElement;

    if (!this.canvas) {
      alert("Canvas not found!");
      return;
    }

    this.context = this.canvas.getContext("webgpu") as GPUCanvasContext;

    this.bounds[0] = this.canvas.width;
    this.bounds[1] = this.canvas.height;

    const adapter = await navigator.gpu.requestAdapter();

    if (!adapter) {
      alert("No adapter found!");
      return;
    }

    this.device = await adapter.requestDevice();

    await Assets.init(this.device);

    this.context.configure({
      device: this.device,
      format: navigator.gpu.getPreferredCanvasFormat(),
    });

    this.spriteRenderer = new SpriteRenderer(
      this.device,
      this.canvas.width,
      this.canvas.height,
    );
    this.spriteRenderer.initialize();

    this.InputManager = new InputManager();
  }

  public async draw() {
    const now = performance.now();
    const dt = now - this.lastTime;
    this.lastTime = now;

    this.onUpdate(dt);

    const commandEncoder = this.device.createCommandEncoder();

    const renderPassDescriptor: GPURenderPassDescriptor = {
      colorAttachments: [
        {
          clearValue: { r: 0.8, g: 0.8, b: 0.8, a: 1.0 },
          loadOp: "clear",
          storeOp: "store",
          view: this.context.getCurrentTexture().createView(),
        },
      ],
    };

    this.passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
    this.spriteRenderer.framePass(this.passEncoder);

    this.onDraw();

    // Draw here

    this.spriteRenderer.frameEnd();

    // End Draw
    this.passEncoder.end();
    this.device.queue.submit([commandEncoder.finish()]);

    requestAnimationFrame(() => this.draw());
  }
}
