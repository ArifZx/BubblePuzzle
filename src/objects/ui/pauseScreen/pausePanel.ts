import RectButton from "../base/rectButton";

export default class PausePanel extends Phaser.GameObjects.Container {
  panel: Phaser.GameObjects.Rectangle;
  title: Phaser.GameObjects.Text;
  resumeButton: RectButton;
  soundButton: RectButton;

  private _scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    this._scene = scene;

    this.panel = new Phaser.GameObjects.Rectangle(
      scene,
      0,
      0,
      400,
      325,
      0x314463
    );
    this.panel.setOrigin(0.5, 0);

    this.title = new Phaser.GameObjects.Text(scene, 0, 0, "Paused", {
      fontSize: "64px"
    });
    this.title.setOrigin(0.5, 0);

    this.resumeButton = new RectButton(scene, 0, 255, {
      text: "Resume",
      hoverScale: 1.2,
      width: 300
    });

    this.resumeButton.on("action", () => {
      this.emit("resume");
    });

    this.soundButton = new RectButton(scene, 0, 125, {
      text: `Sound: ${scene.sound.volume ? "Off" : "On"}`,
      hoverScale: 1.2,
      width: 300
    });

    this.soundButton.on("action", () => {
      this._scene.sound.volume = this._scene.sound.volume > 0 ? 0 : 1;
      this.updateText();
    });

    this.add(this.panel);
    this.add(this.title);
    this.add(this.resumeButton);
    this.add(this.soundButton);

    scene.add.existing(this);
  }

  updateText() {
    this._scene.time.delayedCall(150, () => {
      const isHasSound = this._scene.sound.volume > 0;
      this.soundButton.text.setText(`Sound: ${isHasSound ? "On" : "Off"}`);
      this.soundButton.text.setTint(isHasSound ? 0xffffff : 0xff0000);
    });
  }
}
