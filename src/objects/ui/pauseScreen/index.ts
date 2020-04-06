import RectButton from "../base/rectButton";
import PausePanel from "./pausePanel";

class PauseScreen extends Phaser.GameObjects.Container {

  pauseText: Phaser.GameObjects.Text;
  resumeButton: RectButton;
  panel: PausePanel;

  constructor(scene: Phaser.Scene, isShow = false) {
    const {width, height} = scene.game.config;
    const w = width as number;
    const h = height as number;

    const rect = new Phaser.GameObjects.Rectangle(scene, 0, 0, w, h, 0x000, 0.5);
    rect.setOrigin(0);
    
    super(scene, 0, 0, [rect]);
    this.setDepth(1000);
    this.width = w;
    this.height = h;

    this.panel = new PausePanel(scene, w * 0.5, h * 0.5 - 200);
    this.add(this.panel);

    this.panel.on("resume", () => this.hide());
    rect.setInteractive().on("pointerdown", ()=>{})

    if(isShow) {
      this.show();
    } else {
      this.hide();
    }
    
    scene.add.existing(this);
  }

  hide() {
    this.setPosition(-1000, -1000);
    this.emit("hide");
  }

  show() {
    this.setPosition(0, 0);
    this.emit("show");
  }
}

export default PauseScreen;