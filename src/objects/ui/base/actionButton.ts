import { Scene, GameObjects } from "phaser"
import options from "../../../options";

class ActionButton extends GameObjects.Image {

  hoverScale: number;
  protected _initScale = 1;

  constructor(scene: Scene, x: number, y: number, texture: string, hoverScale = 1.5, frame?: string | number) {
    super(scene, x, y, texture, frame);
    this.hoverScale = hoverScale;
    this.setOrigin(0.5);

    this.setInteractive()
      .on("pointerover", () => {
        super.setScale(this.hoverScale * this._initScale);
      })
      .on("pointerout", () => {
        super.setScale(this._initScale);
      })
      .on("pointerdown", () => {
        this.emit("action");
      });

    scene.add.existing(this);
  }

  setScale(x: number, y?: number) {
    super.setScale(x, y);
    this._initScale = this.scale;
    return this;
  }
}

export default ActionButton;