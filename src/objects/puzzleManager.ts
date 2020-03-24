import Bubble from "./bubble";

export type RowCol = {
  row: number;
  column: number;
};

export type PuzzleConfig = {
  row?: number;
  column?: number;
  initRow?: number;
  data?: string;
};

class PuzzleManager extends Phaser.GameObjects.Container {
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
  isColumnOdd = false;
  bubbleScale = 0.75;

  initRows = 5;

  tileWidth = 90;
  tileHeight = 90;

  private _scene: Phaser.Scene;
  private _time: Phaser.Time.Clock;

  constructor(scene: Phaser.Scene, x: number, y: number, width?: number, height?: number) {

    super(scene, x, y, []);
    this.width = width || (scene.game.config.width as number);
    this.height = height || (scene.game.config.height as number);
    this.tileWidth = this.width / this.columns;
    this.tileHeight = this.tileWidth;

    this.bubbles = [];
    this.isSnapping = false;
    scene.sys.updateList.add(this);
    scene.add.existing(this);
    this._scene = scene;
    this._time = scene.time;
    this.setupBoard();
  }

  get game(): Phaser.Game {
    return this._scene && this._scene.game;
  }

  get gameConfig(): Phaser.Core.Config {
    return this.game && this.game.config;
  }

  preUpdate() {
    if (this.launchBubble) {
      if (this.isBaseBubble(this.launchBubble)) {
        this.snapBubble(this.launchBubble);
        this.launchBubble = null;
      }
    }
  }

  setupBoard(row = 11, column = 8, initRows = 5) {
    this.columns = column ? Math.max(1, Math.abs(column)) : this.columns;
    this.rows = row ? Math.max(1, Math.abs(row)) : this.rows;

    this.tileWidth = this.width / this.columns;
    this.tileHeight = this.tileWidth;

    this.bubbleScale = (0.75 * this.tileWidth) / 90;
    this.initRows = Math.min(this.rows, initRows);
    this.isColumnOdd = !!(this.columns % 2);

  }

  /**
   * Set bubble when bubble is launch from launcher
   * @param bubble
   * @param context
   */
  setLaunchBubble(bubble: Bubble, context?: PuzzleManager) {
    const ctx = context || this;
    ctx.setOverlap(
      bubble,
      (current, other) => ctx.snapBubble(current, other),
      ctx
    );
    ctx.launchBubble = bubble;
  }

  /**
   * Snap bubble with neighbor or self
   * minSnap:
   *  default: 3
   *  min: 1
   * @param bubble
   * @param neighbor
   * @param minSnap
   * @param sameColor
   */
  snapBubble(bubble: Bubble, neighbor?: Bubble, minSnap = 3, sameColor = true) {
    // once snaping

    if (bubble) {
      bubble.stopImmediately();
    }

    if (neighbor) {
      neighbor.stopImmediately();
    }

    if (!this.isSnapping) {
      const min = Math.max(minSnap, 1);
      this.isSnapping = true;

      // get temp row col bubble
      let rowCol: RowCol;

      if (neighbor) {
        rowCol = this.getEmptyNeighbourRowCol(bubble.x, bubble.y, neighbor);
      }

      if (!rowCol) {
        rowCol = this.getBubbleRowCol(bubble);
      }

      this.launchBubbleRowCol = rowCol;
      bubble.setRowCol(rowCol.row, rowCol.column);
      this.bubbles[rowCol.row][rowCol.column] = bubble;
      bubble.setSnapPosition(this.getCoordinate(rowCol.row, rowCol.column));

      const neighbors = this.traceBubble(bubble, sameColor);
      const isPoped = neighbors.length >= min;
      if (isPoped) {
        neighbors.forEach((v, i) => {
          this._time.delayedCall(100 * i, () => v.pop());
          this.removeBubble(v);
        });
      }

      this._time.delayedCall(neighbors.length * 100, () => {
        const isClear = this.bubbles[0].reduce((acc, cur) => {
          if (acc && cur) {
            acc = false;
          }

          return acc;
        }, true);

        const isLastRow = rowCol.row >= this.rows - 1;

        this.emit(
          "poppedBubbles",
          isPoped,
          neighbors.length >= min ? neighbors : [],
          isLastRow,
          isClear
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

  /**
   * Get bubble by row and column
   * @param row
   * @param column
   */
  getBubble(row: number, column: number) {
    if (row >= 0 && column >= 0 && row < this.rows && column < this.columns) {
      return this.bubbles[row][column];
    }

    return null;
  }

  /**
   * Get bubble by RowCol
   * @param rowCol
   */
  getBubbleByRowCol(rowCol: RowCol) {
    return this.getBubble(rowCol.row, rowCol.column);
  }

  /**
   * Get bubble by coordinate position
   * @param x
   * @param y
   */
  getBubbleByCoordinate(x: number, y: number) {
    const rowCol = this.getRowCol(x, y);
    return this.getBubble(rowCol.row, rowCol.column);
  }

  /**
   * Generate bubbles
   * @param row
   * @param column
   */
  generateBubbles(config?: PuzzleConfig) {
    const puzzleData: number[][] = [];
    if (config) {
      const { row, column, initRow, data } = config;
      if (data) {
        let maxColumns = 0;
        data.split("\n").forEach(line => {
          const chars: number[] = [];
          for (let i = 0; i < line.length; i++) {
            try {

              if(line[i].toLowerCase()  === 'x') {
                chars.push(-1); // empty slot
              } else {
                chars.push(parseInt(line[i])); // bubble slot
              }
              
            } catch (error) {
              console.error(`Line[${i}]: '${line[i]}' is not a number`);
            }

            if (chars.length > maxColumns) {
              maxColumns = chars.length;
            }
          }

          puzzleData.push(chars);
        });

        this.setupBoard(
          config.row || puzzleData.length,
          config.column || maxColumns,
          config.initRow
        );
      } else {
        this.setupBoard(row, column, initRow);
      }
    }

    this.bubbles = [];

    // if has data
    if (puzzleData.length) {
      // Loop every puzzleData
      for (let _row = 0; _row < puzzleData.length; _row++) {
        this.bubbles.push(Array(puzzleData[_row].length));
        for (let _column = 0; _column < puzzleData[_row].length; _column++) {
          if (_row < this.initRows && puzzleData[_row][_column] >= 0) { // bubble slot
            const coord = this.getCoordinate(_row, _column);
            const bubble = new Bubble(this.scene, coord.x, coord.y);
            bubble.setNumberColor(puzzleData[_row][_column]);
            bubble.setScale(this.bubbleScale);
            bubble.setRowCol(_row, _column);
            this.bubbles[_row][_column] = bubble;
          } else { // empty slot
            this.bubbles[_row][_column] = undefined;
          }
        }
      }
    } else {
      // Normal loop
      const maxRow = this.rows;
      for (let _row = 0; _row < maxRow; _row++) {
        // check manual row is odd
        const maxColumns = _row % 2 ? this.columns - 1 : this.columns;
        this.bubbles.push(new Array(maxColumns));
        for (let _column = 0; _column < maxColumns; _column++) {
          if (_row < this.initRows) {
            const coord = this.getCoordinate(_row, _column);
            const bubble = new Bubble(this.scene, coord.x, coord.y);
            bubble.setRandomColor();
            bubble.setScale(this.bubbleScale);
            bubble.setRowCol(_row, _column);
            this.bubbles[_row][_column] = bubble;
          } else {
            this.bubbles[_row][_column] = undefined;
          }
        }
      }
    }
  }

  /**
   * Remove bubble from puzzle
   * @param bubble
   */
  removeBubble(bubble: Bubble) {
    if (bubble) {
      const rowCol = this.getBubbleRowCol(bubble);
      this.bubbles[rowCol.row][rowCol.column] = null;
    }
  }

  /**
   * Remove bubble by row col from puzzle
   * @param row number
   * @param column number
   */
  removeBubbleRowCol(row: number, column: number) {
    this.bubbles[Math.max(0, row)][Math.max(0, column)] = null;
  }

  // Neighbourhood
  /**
   * Get bubble's neighbours by type
   * @param bubble Bubble
   * @param type "normal" | "upper" | "lower" | "sibling"
   */
  private getNeighborsFunction(
    bubble: Bubble,
    type: "normal" | "upper" | "lower" | "sibling"
  ) {
    const neighbors: Bubble[] = [];
    if (bubble) {
      const rowCol = this.getBubbleRowCol(bubble);
      this.neighborsOffsets[this.checkLongRow(rowCol.row)].forEach(value => {
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
          const temp =
            this.checkRowCol({ row, column }) && this.getBubble(row, column);
          if (temp) {
            neighbors.push(temp);
          }
        }
      });
    }

    return neighbors;
  }

  /**
   * Get empty neighbour row col
   * @param x bubble x position
   * @param y bubble y position
   * @param neighbor bubble's neighbour
   */
  getEmptyNeighbourRowCol(x: number, y: number, neighbor: Bubble): RowCol {
    let tempRowCol: RowCol;
    let minDistance = Number.MAX_VALUE;
    const { row, column } = this.getBubbleRowCol(neighbor);

    const offsets = [];
    const touch = neighbor.body.touching;
    this.neighborsOffsets[this.checkLongRow(row)].forEach(offset => {
      if (touch.up && offset[1] < 0) {
        offsets.push(offset);
      }

      if (touch.down && offset[1] > 0) {
        offsets.push(offset);
      }

      if (touch.left && offset[0] < 0) {
        offsets.push(offset);
      }

      if (touch.right && offset[0] > 0) {
        offsets.push(offset);
      }
    });

    offsets.forEach(offset => {
      const nRowCol: RowCol = {
        row: row + offset[1],
        column: column + offset[0]
      };

      if (
        this.checkRowCol(nRowCol) &&
        !this.bubbles[nRowCol.row][nRowCol.column]
      ) {
        const nPos = this.getCoordinate(nRowCol.row, nRowCol.column);
        const distance = new Phaser.Math.Vector2(
          nPos.x - x,
          nPos.y - y
        ).length();
        if (distance <= minDistance) {
          minDistance = distance;
          tempRowCol = nRowCol;
        }
      }
    });

    return tempRowCol;
  }

  /**
   * Get neighbour one step pentagon
   * @param bubble
   */
  getNeighbors(bubble: Bubble) {
    return this.getNeighborsFunction(bubble, "normal");
  }

  /**
   * Get lower neigbours
   * neighbour.y == bubble.y or row(neighbour) == row(bubble)
   * @param bubble
   */
  getNeighborsSameColor(bubble: Bubble) {
    return this.getNeighbors(bubble).filter(
      value => value.color === bubble.color
    );
  }

  /**
   * Get upper neigbours
   * neighbour.y < bubble.y or row(neighbour) < row(bubble)
   * @param bubble
   */
  getUpperNeighbors(bubble: Bubble) {
    return this.getNeighborsFunction(bubble, "upper");
  }

  /**
   * Get lower neigbours
   * neighbour.y > bubble.y or row(neighbour) > row(bubble)
   * @param bubble
   */
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
  isBaseBubble(bubble: Bubble): boolean {
    return !(bubble && bubble.y > this.tileHeight * 0.5 + this.y);
  }

  /**
   * Get all floating bubbles
   */
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
                isFloating = !this.isBaseBubble(v);
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

  /**
   * Get and drop all floating bubbles
   */
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
        if(currentBubble) {
          const collider  = ctx.scene.physics.add.collider(
            bubble,
            currentBubble,
            callback,
            null,
            this
          );

          collider.setName(currentBubble.id);
        }
      });
    });
  }

  /**
   * Get coordinate position bubble by row and cols number
   * @param row
   * @param column
   */
  getCoordinate(row: number, column: number): Phaser.Math.Vector2 {
    let temp = new Phaser.Math.Vector2();
    temp.x = (column + 1) * this.tileWidth - this.tileWidth * 0.5 + this.x;

    if (this.checkLongRow(row)) {
      temp.x += this.tileWidth * 0.5;
    }

    temp.y = (row + 1) * this.tileHeight - this.tileHeight * 0.5 + this.y;
    return temp;
  }

  /**
   * Get bubble's row and column number
   * @param bubble
   */
  getBubbleRowCol(bubble: Bubble): RowCol {
    if (!bubble) {
      return { row: 0, column: 0 };
    }

    if (bubble.row >= 0) {
      return { row: bubble.row, column: bubble.column };
    }

    return this.getRowCol(bubble.x, bubble.y);
  }

  /**
   * Check row col is valid
   * @param rowCol
   */
  checkRowCol(rowCol: RowCol): boolean {
    const { row, column } = rowCol;
    const baseCheck = row >= 0 && row < this.rows && column >= 0;
    const isLongRow = this.checkLongRow(row);
    
    if(isLongRow === undefined) {
      return false;
    }

    if (isLongRow) {
      return baseCheck && column < this.columns - 1;
    } else {
      return baseCheck && column < this.columns;
    }
  }

  checkLongRow(row: number) {
    const isOdd = this.bubbles[row] && this.bubbles[row].length % 2;
    
    if(isOdd === undefined) {
      return isOdd;
    }

    return Math.abs(isOdd - (this.isColumnOdd ? 1 : 0));
  }

  /**
   * Get rowCol number by coordinate prosition
   * @param x
   * @param y
   */
  getRowCol(x: number, y: number): RowCol {
    let temp = { row: 0, column: 0 };

    temp.row = Math.min(
      Math.round((y + this.tileHeight * 0.5 - this.y) / this.tileHeight - 1),
      this.rows
    );

    const tempX = this.checkLongRow(temp.row) ? x - this.tileWidth * 0.5 : x;

    temp.column = Math.min(
      Math.round((tempX + this.tileWidth * 0.5 - this.x) / this.tileWidth - 1),
      this.columns
    );

    temp.row = Math.max(0, temp.row);
    temp.column = Math.max(0, temp.column);
    temp.column = Math.min(
      temp.column,
      this.checkLongRow(temp.row) ? this.columns - 2 : this.columns - 1
    );

    return temp;
  }
}

export default PuzzleManager;
