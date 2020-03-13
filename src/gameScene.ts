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

    // let bubble = new Bubble(this, 1000, 1000);
    // puzzle.followBubble = bubble;
    // puzzle.setOverlap(bubble, puzzle);

    this.input.on('pointerdown', (pointer) => {
      // console.log();
      const rowCol = puzzle.getRowCol(pointer.x, pointer.y);
      const bubble = puzzle.getBubbleByRowCol(rowCol);
      console.log( pointer.x, pointer.y, rowCol, bubble && 'ADA' || 'KOSONG');
      if(bubble) {
        bubble.pop(() => {
          console.log(puzzle.getNeighbors(bubble).map(v => v.color.toString(16)));
          puzzle.removeBubble(bubble);
        });
      }

    }, this)

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
