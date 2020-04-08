import { Math as PhaserMath, Scene, GameObjects, Geom, Sound, Input } from "phaser"
import options from "../options";
import Bubble from "./bubble";
import Puzzle from "./puzzleManager";

class BubbleLauncher extends GameObjects.Container {
  touchPosition: PhaserMath.Vector2;
  isTracing: boolean;
  isFlip: boolean;
  isInteractive: boolean;
  arrow: GameObjects.Sprite;

  angle: number;
  guidePointLength: number;
  aimLength: number;
  borderLineLeft: Geom.Line;
  borderLineRight: Geom.Line;
  leftBorder: number;
  rightBorder: number;
  reflectedLine: Geom.Line;
  aimLine: Geom.Line;
  pointerLine: Geom.Line;
  graphics: GameObjects.Graphics;

  rectPad: GameObjects.Rectangle;

  launchSpeed: number;
  pointerLength: number;

  puzzle: Puzzle;
  currentBubble: Bubble;
  nextBubble: Bubble;
  colorOrder: number[];

  splatSFX: Sound.BaseSound;
  isPaused: boolean;

  private _scene: Scene;
  private _counter: number;
  private _prevX: number;
  private _prevY: number;
  private _bubbleWidth: number;
  private _afterPaused: boolean;

  constructor(scene: Scene, x: number, y: number, puzzle: Puzzle, colorOrder?: number[]) {
    const { width, height } = scene.game.config;

    // super(scene, x, y, width as number, 0.25 * (height as number), 0x7f6388);
    super(scene, x, y);
    this.width = width as number,
      this.height = 0.25 * (height as number);
    this._scene = scene;
    this._counter = 0;

    this.rectPad = new GameObjects.Rectangle(scene, x, y, this.width, this.height, 0x7f6388);
    this.rectPad.setOrigin(0.5, 0);
    this.list.push(this.rectPad);

    this.isInteractive = false;
    this.isTracing = false;
    this.touchPosition = null;
    this.puzzle = puzzle;
    this.launchSpeed = 2500;
    this.isPaused = false;
    this._afterPaused = false;

    scene.add.existing(this.rectPad);
    scene.add.existing(this);

    this.splatSFX = scene.sound.add(options.launcher.sfx.splat.name);

    this.arrow = scene.add.sprite(x, y, options.arrow.texture.name);
    this.arrow.setDepth(2);
    this.arrow.setAlpha(0);

    this.guidePointLength = 100;
    this.graphics = this._scene.add.graphics();
    this.pointerLine = new Geom.Line();
    this.aimLine = new Geom.Line();
    this.aimLength = this.y;
    this.reflectedLine = new Geom.Line();
    this.borderLineLeft = new Geom.Line(0, 0, 0, height as number);
    this.borderLineRight = new Geom.Line(
      width as number,
      0,
      width as number,
      height as number
    );
    this.leftBorder = 0;
    this.rightBorder = width as number;

    this.colorOrder = colorOrder || [];
    this.generateBubble();
    // this.setLaunchInteractive();
  }

  setColorOrder(order: number[], forceGenerateBubble = true) {
    this._counter = 0;
    this.colorOrder = order;
    this.generateBubble(forceGenerateBubble);
  }

  preUpdate() {

    if (this.isInteractive) {

      const pointer = this._scene.input.activePointer;
      if (!this.isPaused && this._afterPaused && !pointer.isDown) {
        this._afterPaused = false;
      }

      if (this._afterPaused) {
        if (this.isTracing) {
          this.stopTracing();
        }
      } else {
        if (pointer.isDown) {

          if (!this.isTracing) {
            this.startTracing(pointer);
            this.redraw();
          }

          if ((this._prevY !== pointer.y || this._prevX !== pointer.x)) {
            if (this.isTracing) {
              this.trace(pointer);
            }
            this.redraw();
          }

          if (this.isTracing && this.currentBubble && this.pointerLength < this.currentBubble.width * this.currentBubble.scale * 0.5) {
            this.stopTracing();
            this.redraw();
          }

        } else if (this.isTracing) {
          this.stopTracing();
          if (this.currentBubble) {
            this.launch(pointer.position.clone());
          }
        }
      }


    } else if (this.isTracing) {
      this.stopTracing();
    }
  }

  /**
   * Set launcher interactive
   * @param active default true
   */
  setLaunchInteractive(active = true) {
    this.isInteractive = active;
  }

  redraw() {
    this.graphics.clear();

    if (this.isTracing) {
      // pointer line
      this.graphics.lineStyle(5, 0xffffff);
      this.graphics.strokeLineShape(this.pointerLine);
      this.graphics.depth = this.depth;

      // guide lines
      let border: "left" | "right";
      let reflectedPoint: Geom.Point;
      if (this.currentBubble) {
        this.graphics.fillStyle(this.currentBubble.color);
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
        const reflecctedAngle = Geom.Line.ReflectAngle(
          this.aimLine,
          border === "left" ? this.borderLineLeft : this.borderLineRight
        );
        Geom.Line.SetToAngle(
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

    if (force) {
      this.currentBubble && this.currentBubble.destroy();
      this.nextBubble && this.nextBubble.destroy();
      this.currentBubble = null;
      this.nextBubble = null;
    }

    if (!this.currentBubble) {
      const generatedBubble = this.nextBubble || new Bubble(this._scene, this.x, this.y);
      this.currentBubble = generatedBubble;

      if (!this.nextBubble) {
        if (this.colorOrder.length) {
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

      this.redraw();
    }

    if (!this.nextBubble && this.currentBubble) {
      const offset = this.currentBubble.width * 0.33;
      this.nextBubble = new Bubble(this._scene, this.x + offset, this.y + offset);
      if (this.colorOrder.length) {
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

  launch(endPosition: PhaserMath.Vector2) {
    this.isTracing = false;

    if (this.currentBubble) {
      this.splatSFX.play();
      const direction = new PhaserMath.Vector2(
        endPosition.x - this.x,
        endPosition.y - this.y
      ).normalize();

      this.currentBubble.setVelocity(
        direction.x * this.launchSpeed * (this.isFlip ? -1 : 1),
        direction.y * this.launchSpeed * (this.isFlip ? -1 : 1)
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

  startTracing(pointer: Input.Pointer) {
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

  setPaused(pause = true) {
    this.isPaused = pause;
    if (this.isPaused) {
      this._afterPaused = true;
      this.release();
      this.stopTracing();
      this.setLaunchInteractive(false);
    } else {
      this.setLaunchInteractive();
    }
  }

  trace(pointer: Input.Pointer): void {
    const x = this.x - pointer.x;
    const y = this.y - pointer.y;
    const vectorPointer = new PhaserMath.Vector2(x, y);
    const direction = vectorPointer.clone().normalize();
    this.pointerLength = vectorPointer.length();
    this.isFlip = y < 90;

    // set arrow and lines
    this.arrow.setAngle(direction.angle() * PhaserMath.RAD_TO_DEG + (this.isFlip ? 90 : -90));
    this.arrow.setAlpha(this.isFlip ? 1 : 0);
    this.pointerLine.setTo(
      this.x,
      this.y,
      this.isFlip ? this.x - direction.x * this.pointerLength : this.x,
      this.isFlip ? this.y - direction.y * this.pointerLength : this.y
    );

    this.aimLine.setTo(
      this.x,
      this.y,
      this.x + direction.x * this.aimLength * (this.isFlip ? 1 : -1),
      this.y + direction.y * this.aimLength * (this.isFlip ? 1 : -1)
    );

    this._prevX = pointer.x;
    this._prevY = pointer.y;
  }
}

export default BubbleLauncher;
