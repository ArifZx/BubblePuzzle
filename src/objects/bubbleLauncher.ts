import options from "../options";
import Bubble from "./bubble";
import Puzzle from "./puzzleManager";

class BubbleLauncher extends Phaser.GameObjects.Rectangle {
  touchPosition: Phaser.Math.Vector2;
  isTracing: boolean;
  arrow: Phaser.GameObjects.Sprite;

  guidePointLength: number;
  aimLength: number;
  borderLineLeft: Phaser.Geom.Line;
  borderLineRight: Phaser.Geom.Line;
  leftBorder: number;
  rightBorder: number;
  reflectedLine: Phaser.Geom.Line;
  aimLine: Phaser.Geom.Line;
  pointerLine: Phaser.Geom.Line;
  graphics: Phaser.GameObjects.Graphics;

  launchSpeed: number;

  puzzle: Puzzle;
  currentBubble: Bubble;
  nextBubble: Bubble;
  colorOrder: number[];

  splatSFX: Phaser.Sound.BaseSound;

  private _scene: Phaser.Scene;
  private _counter;

  constructor(scene: Phaser.Scene, x: number, y: number, puzzle: Puzzle, colorOrder?: number[]) {
    const { width, height } = scene.game.config;

    super(scene, x, y, width as number, 0.25 * (height as number), 0x7f6388);
    this._scene = scene;
    this._counter = 0;

    this.isTracing = false;
    this.touchPosition = null;
    this.puzzle = puzzle;
    this.launchSpeed = 2500;

    this.setOrigin(0.5, 0);

    scene.add.existing(this);

    this.splatSFX = scene.sound.add(options.launcher.sfx.splat.name);

    this.arrow = scene.add.sprite(x, y, options.arrow.texture.name);
    this.arrow.setDepth(2);
    this.arrow.setAlpha(0);

    this.guidePointLength = 100;
    this.graphics = this._scene.add.graphics();
    this.pointerLine = new Phaser.Geom.Line();
    this.aimLine = new Phaser.Geom.Line();
    this.aimLength = this.y;
    this.reflectedLine = new Phaser.Geom.Line();
    this.borderLineLeft = new Phaser.Geom.Line(0, 0, 0, height as number);
    this.borderLineRight = new Phaser.Geom.Line(
      width as number,
      0,
      width as number,
      height as number
    );
    this.leftBorder = 0;
    this.rightBorder = width as number;

    this.colorOrder = colorOrder || [];
    this.generateBubble();
    this.setLaunchInteractive();
  }

  setColorOrder(order: number[], forceGenerateBubble = true) {
    this._counter = 0;
    this.colorOrder = order;
    this.generateBubble(forceGenerateBubble);
  }

  /**
   * Set launcher interactive
   * @param active default true
   */
  setLaunchInteractive(active = true) {
    if (!active) {
      this.removeInteractive();
      return;
    }

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

    if (this.isTracing) {
      // pointer line
      this.graphics.lineStyle(5, 0xffffff);
      this.graphics.strokeLineShape(this.pointerLine);

      // guide lines
      let border: "left" | "right";
      let reflectedPoint: Phaser.Geom.Point;
      if (this.currentBubble) {
        this.graphics.defaultFillColor = this.currentBubble.color;
      }
      const aimPoints = this.aimLine.getPoints(this.guidePointLength);
      for (let i = 0; i < aimPoints.length; i++) {
        // check each point has bubble in puzzle
        if (
          this.puzzle &&
          this.puzzle.getBubbleByCoordinate(aimPoints[i].x, aimPoints[i].y)
        ) {
          break;
        }

        this.graphics.fillRect(aimPoints[i].x - 3, aimPoints[i].y - 3, 6, 6);

        if (aimPoints[i].x <= this.leftBorder) {
          border = "left";
        } else if (aimPoints[i].x >= this.rightBorder) {
          border = "right";
        }

        if (border) {
          reflectedPoint = aimPoints[i];
          break;
        }
      }

      if (border && reflectedPoint) {
        const reflecctedAngle = Phaser.Geom.Line.ReflectAngle(
          this.aimLine,
          border === "left" ? this.borderLineLeft : this.borderLineRight
        );
        Phaser.Geom.Line.SetToAngle(
          this.reflectedLine,
          reflectedPoint.x,
          reflectedPoint.y,
          reflecctedAngle,
          this.aimLength
        );

        const reflectedPoints = this.reflectedLine.getPoints(
          this.guidePointLength
        );
        for (let i = 0; i < reflectedPoints.length; i++) {
          // check each point has bubble in puzzle
          if (
            this.puzzle &&
            this.puzzle.getBubbleByCoordinate(
              reflectedPoints[i].x,
              reflectedPoints[i].y
            )
          ) {
            break;
          }

          this.graphics.fillRect(
            reflectedPoints[i].x - 3,
            reflectedPoints[i].y - 3,
            6,
            6
          );
        }
      }
    }
  }

  generateBubble(force = false) {

    if(force) {
      this.currentBubble && this.currentBubble.destroy();
      this.nextBubble && this.nextBubble.destroy();
      this.currentBubble = null;
      this.nextBubble = null;
    }

    if (!this.currentBubble) {
      const generatedBubble = this.nextBubble || new Bubble(this._scene, this.x, this.y);
      this.currentBubble = generatedBubble;
      
      if(!this.nextBubble) {
        if(this.colorOrder.length) {
          this.currentBubble.setNumberColor(this.colorOrder[this._counter % this.colorOrder.length]);
        } else {
          this.currentBubble.setRandomColor();
        }
      } else {
        this.currentBubble.setPosition(this.x, this.y);
      }

      this.nextBubble = null;
      this.currentBubble.setScale(
        (this.puzzle && this.puzzle.bubbleScale) || 0.75
      );

      this._scene.time.delayedCall(100, () =>
        this.emit("generatedBubble", generatedBubble)
      );
    }

    if(!this.nextBubble && this.currentBubble) {
      const offset = this.currentBubble.width * 0.33;
      this.nextBubble = new Bubble(this._scene, this.x + offset, this.y + offset);
      if(this.colorOrder.length) {
        this.nextBubble.setNumberColor(this.colorOrder[(this._counter + 1) % this.colorOrder.length]);
      } else {
        this.nextBubble.setRandomColor();
      }
      this.nextBubble.setScale(
        ((this.puzzle && this.puzzle.bubbleScale) || 0.75) * 0.5
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

      this.emit("launchedBubble", this.currentBubble);
      this._counter++;
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
