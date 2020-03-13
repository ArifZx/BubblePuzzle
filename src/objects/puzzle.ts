import Bubble from "./bubble";

class Puzzle extends Phaser.GameObjects.GameObject {
  bubbles: Array<Array<Bubble>>;
  neighborsOffsets = [
    [
      [1, 0],
      [0, 1],
      [-1, 1],
      [-1, 0],
      [-1, -1],
      [0, -1]
    ], // Even row tiles
    [
      [1, 0],
      [1, 1],
      [0, 1],
      [-1, 0],
      [0, -1],
      [1, -1]
    ] // Odd row tiles
  ];

  rows = 11;
  columns = 8;

  initRows = 5;

  tileWidth = 90;
  tileHeight = 90;

  followBubble: Bubble;

  constructor(scene: Phaser.Scene) {
    super(scene, "puzzle");

    this.bubbles = [];
    scene.sys.updateList.add(this);
    scene.add.existing(this);
  }

  get gameConfig(): Phaser.Core.Config {
    return this.scene && this.scene.game.config;
  }

  get game(): Phaser.Game {
    return this.scene && this.scene.game;
  }

  preUpdate() {}

  getBubble(row: number, column: number) {
    if (row >= 0 && column >= 0 && row < this.rows && column < this.columns) {
      return this.bubbles[row][column];
    }

    return null;
  }

  getBubbleByRowCol(rowCol: { row: number; column: number }) {
    return this.getBubble(rowCol.row, rowCol.column);
  }

  generateBubbles() {
    for (let row = 0; row < this.rows; row++) {
      this.bubbles[row] = [];
      const maxColumns = row % 2 ? this.columns - 1 : this.columns;
      for (let column = 0; column < maxColumns; column++) {
        if (row < this.initRows) {
          const coord = this.getCoordinate(row, column);
          const bubble = new Bubble(this.scene, coord.x, coord.y);
          bubble.setRandomColor();
          this.bubbles[row][column] = bubble;
        } else {
          this.bubbles[row][column] = undefined;
        }
      }
    }
  }

  removeBubble(bubble: Bubble) {
    if (bubble) {
      const rowCol = this.getBubbleRowCol(bubble);
      this.bubbles[rowCol.row][rowCol.column] = null;
    }
  }

  removeBubbleRowCol(row: number, column: number) {
    this.bubbles[Math.max(0, row)][Math.max(0, column)] = null;
  }

  private getNeighborsFunction(
    bubble: Bubble,
    type: "normal" | "upper" | "lower" | "sibling"
  ) {
    const neighbors: Bubble[] = [];
    if (bubble) {
      const rowCol = this.getBubbleRowCol(bubble);
      this.neighborsOffsets[rowCol.row % 2].forEach(value => {
        let isOK = false;

        switch (type) {
          case "lower":
            isOK = value[1] > 0;
            break;
          case "upper":
            isOK = value[1] < 0;
            break;
          case "sibling":
            isOK = value[0] == 0;
            break;
          default:
            isOK = true;
            break;
        }

        if (isOK) {
          const row = rowCol.row + value[1];
          const column = rowCol.column + value[0];
          const temp = this.getBubble(row, column);
          if (temp) {
            neighbors.push(temp);
          }
        }
      });
    }

    return neighbors;
  }

  getNeighbors(bubble: Bubble) {
    return this.getNeighborsFunction(bubble, "normal");
  }

  getNeighborsSameColor(bubble: Bubble) {
    return this.getNeighbors(bubble).filter(
      value => value.color === bubble.color
    );
  }

  getUpperNeighbors(bubble: Bubble) {
    return this.getNeighborsFunction(bubble, "upper");
  }

  getLowerNeighbors(bubble: Bubble) {
    return this.getNeighborsFunction(bubble, "lower");
  }

  traceBubble(bubble: Bubble, sameColor = true): Bubble[] {
    const processed: { [id: string]: Bubble } = {};
    const unprocessed: Bubble[] = bubble ? [bubble] : [];

    while (unprocessed.length) {
      const processingBubble = unprocessed.shift();
      processed[processingBubble.id] = processingBubble;
      const neighbors = sameColor
        ? this.getNeighborsSameColor(processingBubble)
        : this.getNeighbors(processingBubble);
      neighbors.filter(v => !processed[v.id]).forEach(v => unprocessed.push(v));
    }

    return Object.keys(processed).map(key => processed[key]);
  }

  setOverlap(bubble: Bubble, context?: Puzzle) {
    const ctx = context || this;
    console.log(ctx.bubbles);
    ctx.bubbles.forEach(bubbles => {
      ctx.scene.physics.add.overlap(
        bubble,
        bubbles,
        ctx.bubbleOverlapHandler,
        null,
        this
      );
    });
  }

  getCoordinate(row: number, column: number): Phaser.Math.Vector2 {
    let temp = new Phaser.Math.Vector2();
    temp.x = (column + 1) * this.tileWidth - this.tileWidth * 0.5;

    if (row % 2) {
      temp.x += this.tileWidth * 0.5;
    }

    temp.y = (row + 1) * this.tileHeight - this.tileHeight * 0.5;
    return temp;
  }

  getBubbleRowCol(bubble: Bubble) {
    if (!bubble) {
      return { row: 0, column: 0 };
    }
    return this.getRowCol(bubble.x, bubble.y);
  }

  getRowCol(x: number, y: number): { row: number; column: number } {
    let temp = { row: 0, column: 0 };

    temp.row = Math.min(
      Math.round((y + this.tileHeight * 0.5) / this.tileHeight - 1),
      this.rows
    );

    const tempX = temp.row % 2 ? x - this.tileWidth * 0.5 : x;

    temp.column = Math.min(
      Math.round((tempX + this.tileWidth * 0.5) / this.tileWidth - 1),
      this.columns
    );

    temp.row = Math.max(0, temp.row);
    temp.column = Math.max(0, temp.column);

    return temp;
  }

  bubbleOverlapHandler(bubble: Bubble) {
    // console.log(this.getRowCol(bubble.x, bubble.y));
  }
}

export default Puzzle;
