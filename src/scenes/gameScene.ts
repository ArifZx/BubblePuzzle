import "phaser";
import Bubble from "../objects/bubble";
import Puzzle from "../objects/puzzleManager";
import BubbleLauncher from "../objects/bubbleLauncher";
import Scoreboard from "../objects/scoreboard";

class GameScene extends Phaser.Scene {
  constructor() {
    super({
      key: "GameScene"
    });
  }

  bubble: Bubble;
  fpsText: Phaser.GameObjects.Text;

  init(data): void { }

  create(): void {
    const scoreboard = new Scoreboard(this, 0, 0);

    let puzzle = new Puzzle(this, 0, 90);
    puzzle.generateBubbles();
    this.fpsText = new Phaser.GameObjects.Text(this, 0, (this.game.config.height as number) - 50, "00", {
      color: "#FFFFFF",
      fontSize: "48px"
    });

    this.fpsText.setDepth(5);

    this.add.existing(this.fpsText);

    this.input.on(
      "pointerdown",
      pointer => {
        // console.log();
        const rowCol = puzzle.getRowCol(pointer.x, pointer.y);
        const bubble = puzzle.getBubbleByRowCol(rowCol);
        // console.log(
        //   pointer.x,
        //   pointer.y,
        //   rowCol,
        //   (bubble && "ADA") || "KOSONG"
        // );
        if (bubble) {
          // console.log(bubble.x, bubble.y);
          // const traceBubbles = puzzle.traceBubble(bubble);

          // traceBubbles.forEach((v, i) => {
          //   this.time.addEvent({
          //     delay: 200 * i,
          //     callbackScope: this,
          //     callback: () => {
          //       console.log(v.y);
          //       v.pop(() => {
          //         puzzle.removeBubble(v);
          //       });
          //     }
          //   });
          // });

          // this.time.delayedCall(200 * traceBubbles.length + 50, () => {
          //   console.log(puzzle.dropAllFloatingBubbles());
          // });
          puzzle.snapBubble(bubble, 1);
        }
      },
      this
    );

    const launcher = new BubbleLauncher(
      this,
      (this.game.config.width as number) * 0.5,
      (this.game.config.height as number) * 0.8,
      puzzle
    );

    launcher.on("launchedBubble", (bubble: Bubble) => {
      console.log("launch");
      puzzle.setLaunchBubble(bubble, puzzle);
    });

    puzzle.on("snapBubble", (bubble: Bubble, isLastRow: boolean) => {
      console.log("snap and generate bubble", isLastRow);
      if (!isLastRow) {
        this.time.delayedCall(200, () => launcher.generateBubble());
      }
    });

    puzzle.on("poppedBubbles", (isPoped: boolean, bubbles: Bubble[], isClear: boolean) => {
      console.log("is clear:", isClear);
      console.log(bubbles);
      scoreboard.addScore(bubbles.length * 10);
      if (isPoped) {
        const floatingBubbles = puzzle.dropAllFloatingBubbles();

        floatingBubbles.forEach((bubbles, i) => {
          this.time.delayedCall((i + 1) * 500, () => {
            scoreboard.addScore(bubbles.length * 20)
          })
        });

        console.log(floatingBubbles);

      }
    })
  }

  update(): void {
    this.fpsText.setText(this.game.loop.actualFps.toFixed(2).toString());
  }
}

export default GameScene;
