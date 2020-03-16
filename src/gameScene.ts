import "phaser";
import Bubble from "./objects/bubble";
import Puzzle from "./objects/puzzleManager";
import BubbleLauncher from "./objects/bubbleLauncher";

class GameScene extends Phaser.Scene {
  constructor() {
    super({
      key: "GameScene"
    });
  }

  bubble: Bubble;

  init(data): void {}

  create(): void {
    let puzzle = new Puzzle(this);
    puzzle.generateBubbles();

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
          const traceBubbles = puzzle.traceBubble(bubble);

          traceBubbles.forEach((v, i) => {
            this.time.addEvent({
              delay: 200 * i,
              callbackScope: this,
              callback: () => {
                // console.log(v.y);
                v.pop(() => {
                  puzzle.removeBubble(v);
                });
              }
            });
          });

          this.time.delayedCall(200 * traceBubbles.length + 50, () => {
            console.log(puzzle.dropAllFloatingBubbles());
          });
        }
      },
      this
    );

    const launcher = new BubbleLauncher(
      this,
      (this.game.config.width as number) * 0.5,
      (this.game.config.height as number) * 0.75,
      puzzle
    );

    launcher.on("launchedBubble", (bubble: Bubble) => {
      console.log("launch");
      puzzle.setLaunchBubble(bubble, puzzle);
    });

    puzzle.on("snapBubble", () => {
      console.log("snap");
      launcher.generateBubble();
    });

    puzzle.on("poppedBubbles", (isPoped: boolean, bubbles: Bubble[]) => {
      console.log(bubbles);
      if(isPoped) {
        console.log(puzzle.dropAllFloatingBubbles());
      }
    })
  }
}

export default GameScene;
