import { Texture } from "./texture";

export class Assets {
  public static playerTexture: Texture;
  public static ufoTexture: Texture;

  public static async init(device: GPUDevice) {
    this.playerTexture = await Texture.createTextureFromURL(
      device,
      "assets/playerShip1_blue.png",
    );

    this.ufoTexture = await Texture.createTextureFromURL(
      device,
      "assets/ufoRed.png",
    );
  }
}
