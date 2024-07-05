import { Assets } from "./assets";
import { Rect } from "./rect";
import { SpriteRenderer } from "./sprite-renderer";

export class Renderer {
  private canvas!: HTMLCanvasElement;
  private context!: GPUCanvasContext;
  private device!: GPUDevice;

  private passEncoder!: GPURenderPassEncoder;

  private spriteRenderer!: SpriteRenderer;

  constructor() {}

  public async init() {
    this.canvas = document.getElementById("canvas") as HTMLCanvasElement;

    if (!this.canvas) {
      alert("Canvas not found!");
      return;
    }

    this.context = this.canvas.getContext("webgpu") as GPUCanvasContext;

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
  }

  public async draw() {
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

    // Draw here
    for (let i = 0; i < 20000; i++) {
      this.spriteRenderer.drawSprite(
        Assets.playerTexture,
        new Rect(
          Math.random() * this.canvas.width,
          Math.random() * this.canvas.height,
          10,
          10,
        ),
      );
    }

    for (let i = 0; i < 20000; i++) {
      this.spriteRenderer.drawSprite(
        Assets.ufoTexture,
        new Rect(
          Math.random() * this.canvas.width,
          Math.random() * this.canvas.height,
          10,
          10,
        ),
      );
    }

    this.spriteRenderer.frameEnd();

    // End Draw
    this.passEncoder.end();
    this.device.queue.submit([commandEncoder.finish()]);

    requestAnimationFrame(() => this.draw());
  }
}
