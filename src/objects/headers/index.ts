import Scoreboard from "./scoreboard";
import Counter from  "./counter";

class Header extends Phaser.GameObjects.Rectangle {

  scoreboard: Scoreboard;
  counter: Counter;

  private _scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    const { width, height } = scene.game.config;
    super(scene, x, y, (width as number), 90, 0x314463);
    this._scene = scene;
    this.setOrigin(0, 0);
    this.setDepth(1);

    this.scoreboard = new Scoreboard(scene, x + this.width * 0.25, y + this.height * 0.25);
    this.scoreboard.setDepth(this.depth + 1);

    this.counter = new Counter(scene, x + 5, y + this.height * 0.25);
    this.counter.setDepth(this.depth + 1);

    scene.add.existing(this);
  }
}


export default Header;