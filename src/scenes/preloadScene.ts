import "phaser";
import options from "../options";

class PreloadScene extends Phaser.Scene {
  constructor() {
    super({
      key: "PreloadScene"
    });
  }

  preload(): void {
    this.load.spritesheet(options.bubble.texture, options.bubble.location, {
      frameWidth: options.bubble.size,
      frameHeight: options.bubble.size
    });
  }

  create(): void {
    this.anims.create({
      key: options.bubble.animation.pop,
      frames: this.anims.generateFrameNumbers(options.bubble.texture, {
        start: 0,
        end: 5
      }),
      repeat: 1,
    });

    this.scene.start("GameScene");
  }
}

export default PreloadScene;
