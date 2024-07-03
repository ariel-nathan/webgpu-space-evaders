import { QuadGeometry } from "../geometries/quad";
import shaderSource from "../shaders/shader.wgsl?raw";
import { Texture } from "./texture";

export class Renderer {
  private context!: GPUCanvasContext;
  private device!: GPUDevice;
  private pipeline!: GPURenderPipeline;
  private positionBuffer!: GPUBuffer;
  private colorBuffer!: GPUBuffer;
  private texCoordsBuffer!: GPUBuffer;
  private texBindGroup!: GPUBindGroup;
  private testTexture!: Texture;

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

    this.testTexture = await Texture.createTextureFromURL(
      this.device,
      "assets/uv_test.png",
    );
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

    const texCoordsLayout: GPUVertexBufferLayout = {
      arrayStride: 2 * Float32Array.BYTES_PER_ELEMENT, // uv * 4 bytes per float
      stepMode: "vertex",
      attributes: [
        {
          shaderLocation: 2,
          offset: 0,
          format: "float32x2",
        },
      ],
    };

    const vertexShader: GPUVertexState = {
      module: shaderModule,
      entryPoint: "vertexMain",
      buffers: [positionBufferLayout, colorBufferLayout, texCoordsLayout],
    };

    const fragmentState: GPUFragmentState = {
      module: shaderModule,
      entryPoint: "fragmentMain",
      targets: [
        {
          format: navigator.gpu.getPreferredCanvasFormat(),
          blend: {
            color: {
              srcFactor: "one",
              dstFactor: "one-minus-src-alpha",
              operation: "add",
            },
            alpha: {
              srcFactor: "one",
              dstFactor: "one-minus-src-alpha",
              operation: "add",
            },
          },
        },
      ],
    };

    const texBindGroupLayout = this.device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.FRAGMENT,
          sampler: {},
        },
        {
          binding: 1,
          visibility: GPUShaderStage.FRAGMENT,
          texture: {},
        },
      ],
    });

    const pipelineLayout = this.device.createPipelineLayout({
      bindGroupLayouts: [texBindGroupLayout],
    });

    this.texBindGroup = this.device.createBindGroup({
      layout: texBindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: this.testTexture.sampler,
        },
        {
          binding: 1,
          resource: this.testTexture.texture.createView(),
        },
      ],
    });

    this.pipeline = this.device.createRenderPipeline({
      vertex: vertexShader,
      fragment: fragmentState,
      primitive: {
        topology: "triangle-list",
      },
      layout: pipelineLayout,
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

    const quad = new QuadGeometry();

    this.positionBuffer = this.createBuffer(quad.positions);
    this.colorBuffer = this.createBuffer(quad.colors);
    this.texCoordsBuffer = this.createBuffer(quad.texCoords);

    passEncoder.setPipeline(this.pipeline);
    passEncoder.setVertexBuffer(0, this.positionBuffer);
    passEncoder.setVertexBuffer(1, this.colorBuffer);
    passEncoder.setVertexBuffer(2, this.texCoordsBuffer);
    passEncoder.setBindGroup(0, this.texBindGroup);
    passEncoder.draw(6);

    passEncoder.end();

    this.device.queue.submit([commandEncoder.finish()]);
  }
}
