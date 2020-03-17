import Bubble from "./bubble";

type RowCol = {
  row: number;
  column: number;
};

class PuzzleManager extends Phaser.GameObjects.GameObject {
  bubbles: Array<Array<Bubble>>;
  launchBubble: Bubble;
  launchBubbleRowCol: RowCol;
  isSnapping: boolean;

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

  private _scene: Phaser.Scene;
  private _time: Phaser.Time.Clock;

  constructor(scene: Phaser.Scene) {
    super(scene, "puzzle");

    this.bubbles = [];
    this.isSnapping = false;
    scene.sys.updateList.add(this);
    scene.add.existing(this);
    this._scene = scene;
    this._time = scene.time;
  }

  get game(): Phaser.Game {
    return this._scene && this._scene.game;
  }

  get gameConfig(): Phaser.Core.Config {
    return this.game && this.game.config;
  }

  preUpdate() {
    if (this.launchBubble) {
      if (this.launchBubble.y <= this.tileHeight * 0.5 + 1) {
        this.launchBubble.setVelocity(0);
        this.snapBubble(this.launchBubble);
        this.launchBubble = null;
      }
    }
  }

  setLaunchBubble(bubble: Bubble, context?: PuzzleManager) {
    const ctx = context || this;
    ctx.launchBubble = bubble;

    ctx.setOverlap(bubble, current => ctx.snapBubble(current), ctx);
  }

  snapBubble(bubble: Bubble, minSnap = 3, sameColor = true) {
    if (!this.isSnapping ) {
      const min = Math.max(minSnap, 1);
      // once snaping
      this.isSnapping = true;
      bubble.setVelocity(0);
      bubble.setAcceleration(0);
      const rowCol = this.getBubbleRowCol(bubble);
      this.launchBubbleRowCol = rowCol;
      this.bubbles[rowCol.row][rowCol.column] = bubble;
      const coord = this.getCoordinate(rowCol.row, rowCol.column);

      this.scene.time.delayedCall(10, () => {
        bubble.setX(coord.x);
        bubble.setY(coord.y);

        const neighbors = this.traceBubble(bubble, sameColor);
        const isPoped = neighbors.length >= min;
        if (isPoped) {
          neighbors.forEach((v, i) => {
            this._time.delayedCall(100 * i, () => v.pop());
            this.removeBubble(v);
          });
        }

        this._time.delayedCall(neighbors.length * 100, () =>
          this.emit(
            "poppedBubbles",
            isPoped,
            neighbors.length >= min ? neighbors : []
          )
        );
      });

      this._time.delayedCall(
        100,
        () => {
          this.launchBubbleRowCol = null;
          this.isSnapping = false;
          this.emit("snapBubble", bubble);
        },
        null,
        this
      );
    }

    if (this.launchBubbleRowCol) {
      const rowCol = this.launchBubbleRowCol;
      const coord = this.getCoordinate(rowCol.row, rowCol.column);
      bubble.setX(coord.x);
      bubble.setY(coord.y);
    }
  }

  getBubble(row: number, column: number) {
    if (row >= 0 && column >= 0 && row < this.rows && column < this.columns) {
      return this.bubbles[row][column];
    }

    return null;
  }

  getBubbleByRowCol(rowCol: RowCol) {
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

  // Neighbourhood
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

  /**
   * Trace connected bubbles
   * @param bubble
   * @param sameColor
   */
  traceBubble(bubble: Bubble, sameColor = true): Bubble[] {
    const processed: { [id: string]: Bubble } = {};
    const unprocessed: Bubble[] = bubble ? [bubble] : [];

    while (unprocessed.length) {
      const processingBubble = unprocessed.shift();
      processed[processingBubble.id] = processingBubble;
      const neighbors = sameColor
        ? this.getNeighborsSameColor(processingBubble)
        : this.getNeighbors(processingBubble);
      neighbors.forEach(v => {
        if (!processed[v.id]) {
          unprocessed.push(v);
        }
      });
    }

    return Object.keys(processed).map(key => processed[key]);
  }

  // Floating Bubble

  private isFloatingBubble(bubble: Bubble): boolean {
    return bubble && bubble.y > this.tileHeight * 0.5;
  }

  getAllFloatingBubble(): Array<Array<Bubble>> {
    const floatingBubbles = [];
    const processedSign: { [id: string]: boolean } = {};

    this.bubbles.forEach((bubbles, i) => {
      if (i) {
        // skip first bubbles
        bubbles.forEach(bubble => {
          if (bubble && !processedSign[bubble.id]) {
            // if bubbles is not processed
            let isFloating = true;
            const trace = this.traceBubble(bubble, false); // trace connected bubbles
            trace.forEach(v => {
              if (isFloating) {
                isFloating = this.isFloatingBubble(v);
              }
              processedSign[v.id] = true;
            });

            if (isFloating) {
              floatingBubbles.push(trace);
            }
          }
        });
      }
    });

    return floatingBubbles;
  }

  dropAllFloatingBubbles() {
    const floatingBubbles = this.getAllFloatingBubble();
    floatingBubbles.forEach(group => {
      group.forEach(bubble => {
        bubble.drop(false);
        this.removeBubble(bubble);
      });
    });

    return floatingBubbles;
  }

  /**
   * set overlap collision bubble to all bubbles
   * @param bubble
   * @param context
   */
  setOverlap(
    bubble: Bubble,
    callback?: (current: Bubble, other: Bubble) => void,
    context?: PuzzleManager
  ) {
    const ctx = context || this;
    ctx.bubbles.forEach(bubbles => {
      bubbles.forEach(currentBubble => {
        currentBubble &&
          ctx.scene.physics.add.overlap(
            bubble,
            currentBubble,
            callback,
            null,
            this
          );
      });
    });
  }


  bubbleOverlapHandler(bubble: Bubble) {
    // console.log(this.getRowCol(bubble.x, bubble.y));
  }

  /**
   * Get coordinate position bubble by row and cols number
   * @param row
   * @param column
   */
  getCoordinate(row: number, column: number): Phaser.Math.Vector2 {
    let temp = new Phaser.Math.Vector2();
    temp.x = (column + 1) * this.tileWidth - this.tileWidth * 0.5;

    if (row % 2) {
      temp.x += this.tileWidth * 0.5;
    }

    temp.y = (row + 1) * this.tileHeight - this.tileHeight * 0.5;
    return temp;
  }

  /**
   * Get bubble's row and column number
   * @param bubble
   */
  getBubbleRowCol(bubble: Bubble) {
    if (!bubble) {
      return { row: 0, column: 0 };
    }
    return this.getRowCol(bubble.x, bubble.y);
  }

  /**
   * Get rowCol number by coordinate prosition
   * @param x
   * @param y
   */
  getRowCol(x: number, y: number): RowCol {
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
}

export default PuzzleManager;
