import shaderSource from "../shaders/shader.wgsl?raw";

export class Renderer {
  private context!: GPUCanvasContext;
  private device!: GPUDevice;
  private pipeline!: GPURenderPipeline;
  private positionBuffer!: GPUBuffer;
  private colorBuffer!: GPUBuffer;

  constructor() {}

  public async init() {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;

    if (!canvas) {
      alert("Canvas not found!");
      return;
    }

    this.context = canvas.getContext("webgpu") as GPUCanvasContext;

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

  private createBuffer(data: Float32Array): GPUBuffer {
    const buffer = this.device.createBuffer({
      size: data.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true,
    });

    new Float32Array(buffer.getMappedRange()).set(data);

    buffer.unmap();

    return buffer;
  }

  private preparePipeline() {
    const shaderModule = this.device.createShaderModule({
      code: shaderSource,
    });

    const positionBufferLayout: GPUVertexBufferLayout = {
      arrayStride: 2 * Float32Array.BYTES_PER_ELEMENT, // xy * 4 bytes per float
      stepMode: "vertex",
      attributes: [
        {
          shaderLocation: 0,
          offset: 0,
          format: "float32x2",
        },
      ],
    };

    const colorBufferLayout: GPUVertexBufferLayout = {
      arrayStride: 3 * Float32Array.BYTES_PER_ELEMENT, // rgb * 4 bytes per float
      stepMode: "vertex",
      attributes: [
        {
          shaderLocation: 1,
          offset: 0,
          format: "float32x3",
        },
      ],
    };

    const vertexShader: GPUVertexState = {
      module: shaderModule,
      entryPoint: "vertexMain",
      buffers: [positionBufferLayout, colorBufferLayout],
    };

    const fragmentState: GPUFragmentState = {
      module: shaderModule,
      entryPoint: "fragmentMain",
      targets: [
        {
          format: navigator.gpu.getPreferredCanvasFormat(),
        },
      ],
    };

    this.pipeline = this.device.createRenderPipeline({
      vertex: vertexShader,
      fragment: fragmentState,
      primitive: {
        topology: "triangle-list",
      },
      layout: "auto",
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

    if (!this.pipeline) {
      this.preparePipeline();
    }

    this.positionBuffer = this.createBuffer(
      new Float32Array([0.0, 0.5, -0.5, -0.5, 0.5, -0.5]),
    );

    this.colorBuffer = this.createBuffer(
      new Float32Array([1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0]),
    );

    passEncoder.setPipeline(this.pipeline);
    passEncoder.setVertexBuffer(0, this.positionBuffer);
    passEncoder.setVertexBuffer(1, this.colorBuffer);
    passEncoder.draw(3);

    passEncoder.end();

    this.device.queue.submit([commandEncoder.finish()]);
  }
}
