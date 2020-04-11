import options from "../../../options";

class ActionPanel extends Phaser.GameObjects.Container {

  panelText: Phaser.GameObjects.Text;
  button: Phaser.GameObjects.Sprite;
  panel: Phaser.GameObjects.Sprite;
  initalPosition: Phaser.Math.Vector2;
  container: Phaser.GameObjects.Container;

  private _scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, x: number, y: number, text: string, isShow = false) {
    super(scene, x, y);
    this.initalPosition = new Phaser.Math.Vector2(x, y);
    this._scene = scene;
    this.setDepth(10);

    this.panel = scene.add.sprite(0, 0, options.panel.texture.name);
    this.panel.setDepth(this.depth);
    this.panel.setScale(1.25);

    this.panelText = scene.add.text(0, 0, text, {
      fontSize: "96px"
    });
    this.panelText.setOrigin(0.5);
    this.panelText.setDepth(this.depth + 1);
    this.panelText.y -= this.panelText.displayHeight;

    this.button = scene.add.sprite(0, 0, options.restartButton.texture.name);
    this.button.setDepth(this.depth + 1);
    this.button.setScale(0.8)
    this.button.y += this.button.displayHeight * 0.5;

    this.container = scene.add.container(x, y, [
      this.panel,
      this.panelText,
      this.button
    ]);
    this.container.setDepth(this.depth);

    this.setButtonInteractive();

    if (isShow) {
      this.show();
    } else {
      this.hide();
    }

    scene.add.existing(this);
  }

  hide() {
    this.container.setPosition(-1000, -1000);
    this.emit("hide");
  }

  show() {
    this.container.setPosition(this.initalPosition.x, this.initalPosition.y);
    this.emit("show");
  }


  setButtonInteractive(active = true) {
    if (!active) {
      this.button.removeInteractive();
    } else {
      this.button.setInteractive()
        .on("pointerover", () => {
          this.button.setScale(1);
        })
        .on("pointerout", () => {
          this.button.setScale(0.8);
        })
        .on("pointerdown", () => {
          this.emit("action");
        });
    }
  }

}

export default ActionPanel;