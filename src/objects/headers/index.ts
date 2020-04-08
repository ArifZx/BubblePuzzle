import { Scene, GameObjects } from "phaser"
import Scoreboard from "./scoreboard";
import Counter from "./counter";
import PauseButton from "./pauseButton";

class Header extends GameObjects.Rectangle {

  scoreboard: Scoreboard;
  counter: Counter;
  pausedButton: PauseButton;

  private _scene: Scene;

  constructor(scene: Scene, x: number, y: number) {
    const { width, height } = scene.game.config;
    super(scene, x, y, (width as number), 90, 0x314463);
    this._scene = scene;
    this.setOrigin(0, 0);

    this.scoreboard = new Scoreboard(scene, x + this.width * 0.25, y + this.height * 0.25);

    this.counter = new Counter(scene, x + 5, y + this.height * 0.25);

    this.pausedButton = new PauseButton(scene, x + this.width - 50, y + this.height * 0.5);
    this.pausedButton.setScale(1.2);

    this.setDepth(1);
    scene.add.existing(this);
  }

  setDepth(value: number) {
    super.setDepth(value);
    this.scoreboard && this.scoreboard.setDepth(this.depth + 1);
    this.counter && this.counter.setDepth(this.depth + 1);
    this.pausedButton && this.pausedButton.setDepth(this.depth + 1);
    return this;
  }
}


export default Header;