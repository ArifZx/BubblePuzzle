import "phaser";
import Bubble from "../objects/bubble";
import Puzzle from "../objects/puzzleManager";
import BubbleLauncher from "../objects/bubbleLauncher";
import Scoreboard from "../objects/scoreboard";
import ActionPanel from "../objects/actionPanel";

class GameScene extends Phaser.Scene {

  bubble: Bubble;
  fpsText: Phaser.GameObjects.Text;
  isPaused: boolean;

  godMode: boolean;

  constructor() {
    super({
      key: "GameScene"
    });

    this.godMode = false;
    this.isPaused = false;
  }

  init(data): void { }

  create(): void {
    const { height, width } = this.game.config;
    const restartPanel = new ActionPanel(this, (width as number) * 0.5, (height as number) * 0.5, "Game Over");
    const winPanel = new ActionPanel(this, (width as number) * 0.5, (height as number) * 0.5, "You Win");

    restartPanel.on("action", () => {
      this.scene.restart();
    });

    winPanel.on("action", () => {
      this.scene.restart();
    });

    const scoreboard = new Scoreboard(this, 0, 0);

    let puzzle = new Puzzle(this, 0, 90);
    puzzle.generateBubbles();
    this.fpsText = new Phaser.GameObjects.Text(this, 0, (height as number) - 50, "00", {
      color: "#FFFFFF",
      fontSize: "48px"
    });

    this.fpsText.setDepth(5);

    this.add.existing(this.fpsText);

    // FOR DEBUG
    this.input.on(
      "pointerdown",
      pointer => {

        if(!this.godMode) {
          return;
        }

        const rowCol = puzzle.getRowCol(pointer.x, pointer.y);
        const bubble = puzzle.getBubbleByRowCol(rowCol);
        if (bubble) {
          puzzle.snapBubble(bubble, null, 1, true);
          console.log(puzzle.getBubbleRowCol(bubble));
          console.log(bubble);
        }
      },
      this
    );

    const cheat = this.input.keyboard.createCombo([
      Phaser.Input.Keyboard.KeyCodes.H,
      Phaser.Input.Keyboard.KeyCodes.E,
      Phaser.Input.Keyboard.KeyCodes.S,
      Phaser.Input.Keyboard.KeyCodes.O,
      Phaser.Input.Keyboard.KeyCodes.Y,
      Phaser.Input.Keyboard.KeyCodes.A,
      Phaser.Input.Keyboard.KeyCodes.M,
    ], {
      resetOnMatch: true,
      resetOnWrongKey: true,
    });

    // assume only one cheat
    this.input.keyboard.on("keycombomatch", (combo, event) => {
      this.godMode = !this.godMode;
      console.log("God mode is", this.godMode);
    }, this); 

    const launcher = new BubbleLauncher(
      this,
      (this.game.config.width as number) * 0.5,
      (this.game.config.height as number) * 0.8,
      puzzle
    );

    launcher.on("launchedBubble", (bubble: Bubble) => {
      // console.log("launch");
      puzzle.setLaunchBubble(bubble, puzzle);
    });

    puzzle.on("snapBubble", (bubble: Bubble) => {
      // console.log("snap and generate bubble", isLastRow);
      this.time.delayedCall(200, () => launcher.generateBubble());
    });

    puzzle.on("poppedBubbles", (isPoped: boolean, bubbles: Bubble[], isLastRow: boolean, isClear: boolean) => {
      // console.log("is clear:", isClear);
      // console.log(bubbles);
      scoreboard.addScore(bubbles.length * 10);
      if (isPoped) {
        this.time.delayedCall(bubbles.length * 50, () => {
          const floatingBubbles = puzzle.dropAllFloatingBubbles();
          // console.log(floatingBubbles);
          floatingBubbles.forEach((bubbles, i) => {
            this.time.delayedCall((i + 1) * 500, () => {
              scoreboard.addScore(bubbles.length * 20)
            })
          });
        }, null, this);
      } else if (isLastRow) {
        launcher.setLaunchInteractive(false);
        restartPanel.show();
      }

      if (isClear) {
        launcher.setLaunchInteractive(false);
        winPanel.show();
      }
    })

    const restartKey = this.input.keyboard.addKey("R");
    restartKey.on("up", event => {
      this.scene.restart();
    }, this)

    const pausedKey = this.input.keyboard.addKey("P");
    pausedKey.on("up", event => {
      this.scene.run((this.isPaused ? "run" : "pause"));
      this.isPaused = !this.isPaused;
    }, this)
  }

  update(): void {
    this.fpsText.setText(this.game.loop.actualFps.toFixed(1).toString());
  }
}

export default GameScene;
