import LevelPanel from "../objects/ui/panel/levelPanel";
import LevelScroller from "../objects/ui/levelScroll";

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({
      key: "MenuScene"
    });
  }

  panel: LevelPanel;

  create() {
    const w = this.game.config.width as number;
    const h = this.game.config.height as number;
    // this.panel = new LevelPanel(this, w * 0.5 - 150, h * 0.5 - 150);
    // this.add.existing(this.panel);

    const scroller = new LevelScroller(this, 0, h * 0.5 - 150);
    this.add.existing(scroller);
  }

  init(data: object) {

  }
}