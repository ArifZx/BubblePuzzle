
class Scoreboard extends Phaser.GameObjects.Container {
  score: number;
  scoreText: Phaser.GameObjects.Text;

  private _scene: Phaser.Scene;
  private _renderScore: number;

  constructor(scene: Phaser.Scene, x: number, y: number, score?: number) {

    const scoreText = new Phaser.GameObjects.Text(scene, x, y, "Score: 0", {
      color: "#FFF",
      fontSize: "64px",
      align: "center"
    });

    super(scene, x, y, [scoreText]);
    this.scoreText = scoreText;
    this.scoreText.setOrigin(0.5);

    this.setScore(score || 0);
    this._renderScore = score || 0;
    scene.time.addEvent({
      delay: 60,
      repeat: -1,
      callbackScope: this,
      callback: () => {
        if (this._renderScore != this.score) {
          this._renderScore = Math.ceil(Phaser.Math.Linear(this._renderScore, this.score, 0.5));
          this.scoreText.setText(`Score: ${this._renderScore}`);
        }
      }
    })

    scene.add.existing(this);
  }

  setScore(score: number) {
    this.score = score;
  }

  addScore(score: number) {
    this.setScore(this.score + score);
  }

  resetScore() {
    this.setScore(0);
  }

}

export default Scoreboard