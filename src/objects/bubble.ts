import "phaser";
import options from "../options";
import { Physics } from "phaser";

class Bubble extends Phaser.Physics.Arcade.Sprite {
  context: Bubble;
  isSnaped: boolean;
  color: number;
  isPoped = false;
  isDroped = false;
  id: string;
  collider: Physics.Arcade.Collider;

  private _scene: Phaser.Scene;
  private _gameHeight: number;
  private _displayHeight: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, options.bubble.texture.name);
    this._scene = scene;
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.isSnaped = false;
    this.id = Phaser.Utils.String.UUID();

    this.setColor(options.bubble.color[0]);
    this.setScale(0.75);
    this.setDepth(1);

    this.setCircle(61, 30, 30);
    this.setCollideWorldBounds(true);
    this.setBounce(1);

    this.anims.load(options.bubble.animation.pop);
    this._gameHeight = this._scene.game.config.height as number;
    this._displayHeight = this.displayHeight;

    scene.time.addEvent({
      repeat: -1,
      delay: 100,
      callbackScope: this,
      callback: () => {
        if(this.y + this._displayHeight > this._gameHeight) {
          this.pop();
        }
      }
    })
  }

  preUpdate() {
    
  }

  setContext(context?: Bubble) {
    this.context = context || this;
  }

  setColor(color: number, context?: Bubble) {
    this.setContext(context);
    this.context.color = color;
    this.context.setTint(color);
  }

  setRandomColor(context?: Bubble) {
    this.setContext(context);
    this.context.setColor(
      options.bubble.color[
        Math.floor(Math.random() * options.bubble.color.length)
      ]
    );
  }

  pop(callback?: () => void) {
    if (!this.isPoped) {
      this.anims.play(options.bubble.animation.pop);
      this._scene.time.addEvent({
        delay: 200,
        callbackScope: this,
        callback: () => {
          this.destroy();
        }
      });
    }

    this.isPoped = true;

    if (callback) {
      callback();
    }
  }

  drop(withPop = true, callback?: () => void, context?: Bubble) {
    if (!this.isDroped) {
      this.setContext(context);
      this.setCollideWorldBounds(false);
      this.context.setGravityY(500);
      if(withPop) {
        this.context.scene.time.addEvent({
          delay: Phaser.Math.Between(200, 500),
          callback: () => {
            this.context.pop();
          },
          loop: false,
          callbackScope: this
        });
      }
    }

    this.isDroped = true;

    if (callback) {
      callback();
    }
  }

  stop(context?: Bubble) {
    this.setContext(context);
    this.context.setBounce(0);
    this.context.setImmovable(true);

    this.context.setVelocity(0, 0);
  }
}

export default Bubble;
