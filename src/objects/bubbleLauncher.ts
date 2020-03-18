import options from "../options";
import Bubble from "./bubble";
import Puzzle from "./puzzleManager";

class BubbleLauncher extends Phaser.GameObjects.Rectangle {
  touchPosition: Phaser.Math.Vector2;
  isTracing: boolean;
  isReady: boolean;
  arrow: Phaser.GameObjects.Sprite;
  aimLength: number;
  aimLine: Phaser.Geom.Line;
  pointerLine: Phaser.Geom.Line;
  graphics: Phaser.GameObjects.Graphics;
  launchSpeed: number;

  puzzle: Puzzle;
  currentBubble: Bubble;

  splatSFX: Phaser.Sound.BaseSound;

  private _scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, x: number, y: number, puzzle: Puzzle) {
    const { width, height } = scene.game.config;

    super(scene, x, y, width as number, 0.25 * (height as number), 0x7f6388);
    this._scene = scene;

    this.isTracing = false;
    this.isReady = true;
    this.touchPosition = null;
    this.puzzle = puzzle;
    this.launchSpeed = 3000;

    this.setOrigin(0.5, 0);

    scene.add.existing(this);

    this.splatSFX = scene.sound.add(options.launcher.sfx.splat.name);

    this.arrow = scene.add.sprite(x, y, options.arrow.texture.name);
    this.arrow.setDepth(2);
    this.arrow.setAlpha(0);

    this.graphics = this._scene.add.graphics();
    this.pointerLine = new Phaser.Geom.Line();
    this.aimLine = new Phaser.Geom.Line();
    this.aimLength = this.y;

    this.generateBubble();

    this.setInteractive()
      .on(
        "pointerdown",
        (pointer: Phaser.Input.Pointer) => {
          this.startTracing(pointer);
          this.redraw();
        },
        this
      )
      .on(
        "pointerup",
        (pointer: Phaser.Input.Pointer) => {
          if (this.isTracing) {
            this.launch(new Phaser.Math.Vector2(pointer.position));
          }
          this.stopTracing();
        },
        this
      )
      .on(
        "pointerout",
        () => {
          this.stopTracing();
        },
        this
      )
      .on(
        "pointermove",
        (pointer: Phaser.Input.Pointer) => {
          if (this.isTracing) {
            this.trace(pointer);
          }
          this.redraw();
        },
        this
      );
  }

  redraw() {
    this.graphics.clear();

    this.graphics.lineStyle(5, 0xffffff, this.isTracing ? 1 : 0);
    this.graphics.strokeLineShape(this.pointerLine);
    this.graphics.lineStyle(
      6,
      (this.currentBubble && this.currentBubble.color) || 0xff0000,
      this.isTracing ? 1 : 0
    );
    this.graphics.strokeLineShape(this.aimLine);
  }

  generateBubble() {
    if (!this.currentBubble) {
      this.isReady = false;
      const generatedBubble = new Bubble(this._scene, this.x, this.y);
      this.currentBubble = generatedBubble;
      this.currentBubble.setRandomColor();

      this._scene.time.delayedCall(100, () =>
        this.emit("generatedBubble", generatedBubble)
      );

      this._scene.time.delayedCall(
        500,
        () => {
          this.isReady = true;
        },
        null,
        this
      );
    }
  }

  showArrow() {
    this.arrow && this.arrow.setAlpha(1);
  }

  hideArrow() {
    this.arrow && this.arrow.setAlpha(0);
  }

  launch(endPosition: Phaser.Math.Vector2) {
    this.isTracing = false;

    if (this.currentBubble) {
      this.splatSFX.play();
      const direction = new Phaser.Math.Vector2(
        endPosition.x - this.x,
        endPosition.y - this.y
      ).normalize();

      this.currentBubble.setVelocity(
        -direction.x * this.launchSpeed,
        -direction.y * this.launchSpeed
      );

      const bubble = this.currentBubble;

      this._scene.time.delayedCall(60, () =>
        this.emit("launchedBubble", bubble)
      );
    }

    this._scene.time.delayedCall(60, () => {
      this.stopTracing();
    });
    this.currentBubble = null;
  }

  release() {
    this.touchPosition = null;
  }

  startTracing(pointer: Phaser.Input.Pointer) {
    if (!this.currentBubble) {
      return;
    }

    this.showArrow();
    this.isTracing = true;
    this.touchPosition = pointer.position;
    this.trace(pointer);
    this.redraw();
  }

  stopTracing() {
    this.hideArrow();
    this.isTracing = false;
    this.release();
    this.redraw();
  }

  trace(pointer) {
    const degree =
      Phaser.Math.Angle.Between(this.x, this.y, pointer.x, pointer.y) *
      Phaser.Math.RAD_TO_DEG;
    const direction = new Phaser.Math.Vector2(
      this.x - pointer.x,
      this.y - pointer.y
    ).normalize();
    this.arrow.setAngle(degree - 90);
    this.pointerLine.setTo(this.x, this.y, pointer.x, pointer.y);
    this.aimLine.setTo(
      this.x,
      this.y,
      this.x + direction.x * this.aimLength,
      this.y + direction.y * this.aimLength
    );
  }
}

export default BubbleLauncher;
