export class Renderer {
  private context!: GPUCanvasContext;
  private device!: GPUDevice;

  constructor() {}

  public async init() {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;

    if (!canvas) {
      alert("Canvas not found!");
      return;
    }

    this.context = canvas.getContext("webgpu") as GPUCanvasContext;

    if (!this.context) {
      alert("WebGPU not supported!");
      return;
    }

    const adapter = await navigator.gpu.requestAdapter();

    if (!adapter) {
      alert("No adapter found!");
      return;
    }

    this.device = await adapter.requestDevice();

    this.context.configure({
      device: this.device,
      format: navigator.gpu.getPreferredCanvasFormat(),
    });
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

    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);

    passEncoder.end();

    this.device.queue.submit([commandEncoder.finish()]);
  }
}
