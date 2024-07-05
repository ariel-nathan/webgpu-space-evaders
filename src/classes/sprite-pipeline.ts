import shaderSource from "../shaders/shader.wgsl?raw";
import { Texture } from "./texture";

export class SpritePipeline {
  public pipeline!: GPURenderPipeline;
  public texBindGroup!: GPUBindGroup;
  public projectionViewBindGroup!: GPUBindGroup;

  public static create(
    device: GPUDevice,
    texture: Texture,
    projectionViewMatrixBuffer: GPUBuffer,
  ) {
    const spritePipeline = new SpritePipeline();
    spritePipeline.init(device, texture, projectionViewMatrixBuffer);
    return spritePipeline;
  }

  public init(
    device: GPUDevice,
    texture: Texture,
    projectionViewMatrixBuffer: GPUBuffer,
  ) {
    const shaderModule = device.createShaderModule({
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

    const projectionViewBindGroupLayout = device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX,
          buffer: {
            type: "uniform",
          },
        },
      ],
    });

    const texBindGroupLayout = device.createBindGroupLayout({
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

    const pipelineLayout = device.createPipelineLayout({
      bindGroupLayouts: [projectionViewBindGroupLayout, texBindGroupLayout],
    });

    this.projectionViewBindGroup = device.createBindGroup({
      layout: projectionViewBindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: {
            buffer: projectionViewMatrixBuffer,
          },
        },
      ],
    });

    this.texBindGroup = device.createBindGroup({
      layout: texBindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: texture.sampler,
        },
        {
          binding: 1,
          resource: texture.texture.createView(),
        },
      ],
    });

    this.pipeline = device.createRenderPipeline({
      vertex: vertexShader,
      fragment: fragmentState,
      primitive: {
        topology: "triangle-list",
      },
      layout: pipelineLayout,
    });
  }
}
