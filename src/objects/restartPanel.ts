import options from "../options";

class RestartPanel extends Phaser.GameObjects.Container {

  gameOverText: Phaser.GameObjects.Text;
  button: Phaser.GameObjects.Sprite;
  panel: Phaser.GameObjects.Sprite;
  initalPosition: Phaser.Math.Vector2;
  container: Phaser.GameObjects.Container;

  private _scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    this.initalPosition = new Phaser.Math.Vector2(x, y);
    this._scene = scene;
    this.setDepth(10);

    this.panel = scene.add.sprite(0, 0, options.panel.texture.name);
    this.panel.setDepth(this.depth);
    this.panel.setScale(1.25);

    this.gameOverText = scene.add.text(0, 0, 'Game Over', {
      fontSize: "96px"
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setDepth(this.depth + 1);
    this.gameOverText.y -= this.gameOverText.displayHeight;

    this.button = scene.add.sprite(0, 0, options.restartButton.texture.name);
    this.button.setDepth(this.depth + 1);
    this.button.setScale(0.8)
    this.button.y += this.button.displayHeight * 0.5;

    this.container = scene.add.container(x, y, [
      this.panel,
      this.gameOverText,
      this.button
    ]);
    this.container.setDepth(this.depth);

    this.setButtonInteractive();

    scene.add.existing(this);
  }

  hide() {
    this.container.setPosition(-1000, -1000);
  }

  show() {
    this.container.setPosition(this.initalPosition.x, this.initalPosition.y);
  }


  setButtonInteractive(active = true) {
    if (!active) {
      this.button.removeInteractive();
    } else {
      this.button.setInteractive()
        .on('pointerover', () => {
          this.button.setScale(1);
        })
        .on('pointerout', () => {
          this.button.setScale(0.8);
        })
        .on('pointerdown', () => {
          this.emit('restart');
        });
    }
  }

}

export default RestartPanel;