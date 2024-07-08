import { vec2 } from "gl-matrix";
import { Assets } from "./assets";
import { Color } from "./color";
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

  rotation = 0;

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
    // for (let i = 0; i < 20000; i++) {
    //   this.spriteRenderer.drawSprite(
    //     Assets.playerTexture,
    //     new Rect(
    //       Math.random() * this.canvas.width,
    //       Math.random() * this.canvas.height,
    //       10,
    //       10,
    //     ),
    //   );
    // }

    // for (let i = 0; i < 20000; i++) {
    //   this.spriteRenderer.drawSprite(
    //     Assets.ufoTexture,
    //     new Rect(
    //       Math.random() * this.canvas.width,
    //       Math.random() * this.canvas.height,
    //       10,
    //       10,
    //     ),
    //   );
    // }

    this.rotation += 0.01;

    const playerSprite = Assets.sprites["playerShip1_blue.png"];
    playerSprite.drawRect.x += 0.7;
    playerSprite.drawRect.y += 0.7;
    this.spriteRenderer.drawSpriteSource(
      playerSprite.texture,
      playerSprite.drawRect,
      playerSprite.sourceRect,
      undefined,
      this.rotation,
      vec2.fromValues(0.5, 0.5),
    );

    const shieldSprite = Assets.sprites["shield1.png"];
    shieldSprite.drawRect.x = playerSprite.drawRect.x - 17;
    shieldSprite.drawRect.y = playerSprite.drawRect.y - 17;
    this.spriteRenderer.drawSpriteSource(
      shieldSprite.texture,
      shieldSprite.drawRect,
      shieldSprite.sourceRect,
      new Color(0, 0, 1),
      this.rotation,
      vec2.fromValues(0.5, 0.5),
    );

    const drawRect = new Rect(100, 100, 200, 200);
    const halfWidth = Assets.uvTexture.width / 2;
    const halfHeight = Assets.uvTexture.height / 2;
    const sourceRect = new Rect(0, halfHeight, halfWidth, halfHeight);
    this.spriteRenderer.drawSpriteSource(
      Assets.uvTexture,
      drawRect,
      sourceRect,
      undefined,
      this.rotation,
      vec2.fromValues(0.5, 0.5),
    );

    this.spriteRenderer.frameEnd();

    // End Draw
    this.passEncoder.end();
    this.device.queue.submit([commandEncoder.finish()]);

    requestAnimationFrame(() => this.draw());
  }
}
