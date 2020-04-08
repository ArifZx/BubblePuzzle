import { Scene } from "phaser";
import options from "../options";

class PreloadScene extends Scene {
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

    this.load.audio(options.bubble.sfx.blop.name, options.bubble.sfx.blop.location);
    this.load.audio(options.launcher.sfx.splat.name, options.launcher.sfx.splat.location);
    this.load.audio(options.music.loop.backsound.name, options.music.loop.backsound.location);

    this.load.image(options.panel.texture.name, options.panel.texture.location);
    this.load.image(options.restartButton.texture.name, options.restartButton.texture.location);

    this.load.image(options.pausedButton.texture.name, options.pausedButton.texture.location);
  }

  create(): void {
    this.anims.create({
      key: options.bubble.animation.pop,
      frames: this.anims.generateFrameNumbers(options.bubble.texture.name, {
        start: 0,
        end: 5,
      }),
      repeat: 0,
    });

    this.scene.start("GameScene", {});
  }
}

export default PreloadScene;
