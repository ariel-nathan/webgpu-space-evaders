import { Rect } from "./rect";
import { Sprite } from "./sprite";
import { Texture } from "./texture";

export class Assets {
  public static playerTexture: Texture;
  public static ufoTexture: Texture;
  public static uvTexture: Texture;
  public static spriteSheet: Texture;
  public static backgroundTexture: Texture;

  public static sprites: { [id: string]: Sprite } = {};

  public static async init(device: GPUDevice) {
    this.playerTexture = await Texture.createTextureFromURL(
      device,
      "assets/playerShip1_blue.png",
    );

    this.ufoTexture = await Texture.createTextureFromURL(
      device,
      "assets/ufoRed.png",
    );

    this.uvTexture = await Texture.createTextureFromURL(
      device,
      "assets/uv_test.png",
    );

    this.spriteSheet = await Texture.createTextureFromURL(
      device,
      "assets/sheet.png",
    );

    this.backgroundTexture = await Texture.createTextureFromURL(
      device,
      "assets/purple.png",
    );

    await this.loadSpriteSheet();
  }

  private static async loadSpriteSheet() {
    const sheetXmlReq = await fetch("assets/sheet.xml");
    const sheetXml = await sheetXmlReq.text();

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(sheetXml, "application/xml");

    xmlDoc.querySelectorAll("SubTexture").forEach((subTexture) => {
      const name = subTexture.getAttribute("name")!.replace(".png", "");
      const x = parseInt(subTexture.getAttribute("x")!);
      const y = parseInt(subTexture.getAttribute("y")!);
      const width = parseInt(subTexture.getAttribute("width")!);
      const height = parseInt(subTexture.getAttribute("height")!);

      const drawRect = new Rect(0, 0, width, height);
      const sourceRect = new Rect(x, y, width, height);

      this.sprites[name] = new Sprite(this.spriteSheet, drawRect, sourceRect);
    });
  }
}
