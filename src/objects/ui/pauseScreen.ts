class PauseScreen extends Phaser.GameObjects.Container {

  pauseText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, isShow = false) {
    const {width, height} = scene.game.config;
    const w = width as number;
    const h = height as number;

    const rect = new Phaser.GameObjects.Rectangle(scene, 0, 0, w, h, 0x000, 0.5);
    rect.setOrigin(0);

    const text  = new Phaser.GameObjects.Text(scene, w * 0.5, h * 0.5, "Paused", {
      fontSize: "64px"
    });
    text.setOrigin(0.5);
    

    super(scene, 0, 0, [rect, text]);
    this.setDepth(1000);
    this.width = w;
    this.height = h;

    rect.setInteractive().on("pointerdown", () => {
      this.hide();
    });

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