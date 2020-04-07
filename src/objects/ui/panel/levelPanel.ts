export default class LevelPanel extends Phaser.GameObjects.Container {
  titleText: Phaser.GameObjects.Text;
  scoreText: Phaser.GameObjects.Text;
  rect: Phaser.GameObjects.Rectangle;

  level: number;
  score: number;
  star: number;

  constructor(scene: Phaser.Scene, x?: number, y?: number, width?: number, height?: number, level?: number, score?: number) {
    super(scene, x, y);
    this.level = level || 1;
    this.score = score || 0;
    this.titleText = new Phaser.GameObjects.Text(scene, 0, 0, `Level ${this.level}`, {
      fontSize: "64px",
      align: "center",
      color: "#ffffff",
    });
    this.titleText.setOrigin(0.5);

    this.scoreText = new Phaser.GameObjects.Text(scene, 0, 0, `Your score: ${this.score}`, {
      fontSize: "24px",
      align: "center",
      color: "#ffffff"
    });
    this.scoreText.setOrigin(0.5);

    this.rect = new Phaser.GameObjects.Rectangle(scene, 0, 0);
    this.rect.setFillStyle(0xf12398, 1);
    this.rect.setOrigin(0);

    this.add(this.rect);
    this.add(this.titleText);
    this.add(this.scoreText);

    this.setSize(width || 300, height || 250);
    scene.add.existing(this);
  }

  setSize(width: number, height: number) {
    super.setSize(width, height);
    this.updateChildPosition();
    this.rect.setSize(width, height);
    return this;
  }

  updateText(){
    this.scoreText.setText(`Your score: ${this.score}`);
    this.titleText.setText(`Level ${this.level}`);
  }

  setLevel(level: number) {
    const isChanged = level !== this.level;
    this.level = level;
    if(isChanged) {
      this.updateText();
    }
  }

  setScore(score: number) {
    const isChanged =  score !== this.score;
    this.score = score;
    if(isChanged) {
      this.updateText();
    }
  }

  setStar(number: number) {
    this.star = number;
  }

  private updateChildPosition() {
    const { width, height } = this;

    this.titleText && this.titleText.setPosition(width * 0.5, height * 0.2);
    this.scoreText && this.scoreText.setPosition(width * 0.5, height * 0.25 + 64)
  }
}
