import { Scene } from "phaser"
import LevelPanel from "../objects/ui/panel/levelPanel";

export default class MenuScene extends Scene {
  constructor() {
    super({
      key: "MenuScene"
    });
  }

  panel: LevelPanel;

  create() {
    const w = this.game.config.width as number;
    const h = this.game.config.height as number;
    this.panel = new LevelPanel(this, w * 0.5 - 150, h * 0.5 - 150);
  }

  init(data: object) {

  }
}