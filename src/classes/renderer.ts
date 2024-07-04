import { QuadGeometry } from "../geometries/quad";
import shaderSource from "../shaders/shader.wgsl?raw";
import { BufferUtil } from "./buffer-util";
import { Texture } from "./texture";

export class Renderer {
  private context!: GPUCanvasContext;
  private device!: GPUDevice;
  private pipeline!: GPURenderPipeline;
  private verticesBuffer!: GPUBuffer;
  private texBindGroup!: GPUBindGroup;
  private indexBuffer!: GPUBuffer;

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

    this.preparePipeline();

    const quad = new QuadGeometry();

    this.verticesBuffer = BufferUtil.createVertexBuffer(
      this.device,
      new Float32Array(quad.vertices),
    );
    this.indexBuffer = BufferUtil.createIndexBuffer(
      this.device,
      new Uint16Array(quad.indices),
    );
  }

  private preparePipeline() {
    const shaderModule = this.device.createShaderModule({
      code: shaderSource,
    });

    const bufferLayout: GPUVertexBufferLayout = {
      arrayStride: 7 * Float32Array.BYTES_PER_ELEMENT,
      stepMode: "vertex",
      attributes: [
        {
          shaderLocation: 0,
          offset: 0,
          format: "float32x2",
        },
        {
          shaderLocation: 1,
          offset: 2 * Float32Array.BYTES_PER_ELEMENT,
          format: "float32x2",
        },
        {
          shaderLocation: 2,
          offset: 4 * Float32Array.BYTES_PER_ELEMENT,
          format: "float32x3",
        },
      ],
    };

    const vertexShader: GPUVertexState = {
      module: shaderModule,
      entryPoint: "vertexMain",
      buffers: [bufferLayout],
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

    passEncoder.setPipeline(this.pipeline);
    passEncoder.setIndexBuffer(this.indexBuffer, "uint16");
    passEncoder.setVertexBuffer(0, this.verticesBuffer);
    passEncoder.setBindGroup(0, this.texBindGroup);
    passEncoder.drawIndexed(6);

    passEncoder.end();
    this.device.queue.submit([commandEncoder.finish()]);
  }
}
