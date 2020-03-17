class Scoreboard extends Phaser.GameObjects.Rectangle {

  score: number;
  scoreText: Phaser.GameObjects.Text;

  private _scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    const { width, height } = scene.game.config;
    super(scene, x, y, width as number, 90, 0x314463);

    this._scene = scene;
    this.setOrigin(0, 0);
    this.setDepth(1);

    this.score = 0;
    this.scoreText = new Phaser.GameObjects.Text(scene, x + (width as number) * 0.5, y + 45, 'asdasds', {
      color: "#FFF",
      fontSize: "64px"
    });

    this.scoreText.setDepth(2);
    this.scoreText.setOrigin(0.5);

    this.resetScore();

    scene.add.existing(this);
    scene.add.existing(this.scoreText);
  }

  setScore(score: number) {
    this.score = score;
    this.scoreText.setText(`Score: ${this.score}`)
  }


  addScore(score: number) {
    this.setScore(this.score + score);
  }

  resetScore() {
    this.setScore(0);
  }
}


export default Scoreboard;