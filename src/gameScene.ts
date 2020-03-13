import "phaser";
import Bubble from "./objects/bubble";
import Puzzle from "./objects/puzzle";

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
        console.log(
          pointer.x,
          pointer.y,
          rowCol,
          (bubble && "ADA") || "KOSONG"
        );
        if (bubble) {
          puzzle.traceBubble(bubble).forEach((v, i) => {
            this.time.addEvent({
              delay: 200 * i,
              callbackScope: this,
              callback: () => {
                v.pop(() => {
                  puzzle.removeBubble(v);
                });
              }
            })
          });
        }
      },
      this
    );

    // this.time.addEvent({
    //   delay: 3000,
    //   callback: () => {
    //     puzzle.bubbles.forEach(bubbles => {
    //       bubbles.forEach(bubble => {
    //         bubble && bubble.drop(() => {
    //           puzzle.removeBubble(bubble);
    //         });
    //       });
    //     });
    //   },
    //   loop: false
    // });

    // this.time.addEvent({
    //   delay: 5000,
    //   callback: () => {
    //     console.log(puzzle.bubbles);
    //   },
    //   loop: false
    // });
  }
}

export default GameScene;
