import "phaser";
import options from "../options";

class PreloadScene extends Phaser.Scene {
  constructor() {
    super({
      key: "PreloadScene"
    });
  }

  preload(): void {
    this.load.spritesheet(options.bubble.texture.name, options.bubble.texture.location, {
      frameWidth: options.bubble.texture.height,
      frameHeight: options.bubble.texture.height,
    });

    this.load.image(options.arrow.texture.name, options.arrow.texture.location);
  }

  create(): void {
    this.anims.create({
      key: options.bubble.animation.pop,
      frames: this.anims.generateFrameNumbers(options.bubble.texture.name, {
        start: 0,
        end: 5,
      }),
      frameRate: 24,
      repeat: -1,
    });

    this.scene.start("GameScene");
  }
}

export default PreloadScene;
