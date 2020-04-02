import "phaser";
import Bubble from "../objects/bubble";
import Puzzle from "../objects/puzzleManager";
import BubbleLauncher from "../objects/bubbleLauncher";
import Header from "../objects/headers";
import ActionPanel from "../objects/ui/base/actionPanel";
import options from "../options";
import PauseScreen from "../objects/ui/pauseScreen";

class GameScene extends Phaser.Scene {

  bubble: Bubble;
  fpsText: Phaser.GameObjects.Text;
  cheatSFX: Phaser.Sound.BaseSound;
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

  preload(): void {
    this.cheatSFX = this.sound.add(options.bubble.sfx.blop.name);
  }

  create(): void {
    const { height, width } = this.game.config;
    const w = width as number;
    const h = height as number;

    const restartPanel = new ActionPanel(this, w * 0.5, h * 0.5, "Game Over");
    const winPanel = new ActionPanel(this, w * 0.5, h * 0.5, "You Win");
    const pauseScreen = new PauseScreen(this);
    const header = new Header(this, 0, 0);
    const puzzle = new Puzzle(this, 0, 45, w);
    const launcher = new BubbleLauncher(this, w * 0.5, h * 0.8, puzzle);
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

    header.setDepth(3);
    puzzle.setDepth(2);


    restartPanel.on("action", () => {
      this.scene.restart();
    });

    winPanel.on("action", () => {
      this.scene.restart();
    });

    header.counter.setTime(60);

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

        if (!this.godMode) {
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

    // assume only one cheat
    this.input.keyboard.on("keycombomatch", (combo, event) => {
      this.godMode = !this.godMode;
      this.cheatSFX.play({
        volume: this.godMode ? 1 : 0.5,
      });
      console.log("God mode is", this.godMode);
    }, this);


    this.time.delayedCall(1000, () => {
      launcher.setLaunchInteractive();
    })

    launcher.on("launchedBubble", (bubble: Bubble) => {
      // console.log("launch");
      puzzle.setLaunchBubble(bubble, puzzle);
      header.counter.start();
    });

    puzzle.on("snapBubble", (bubble: Bubble) => {
      // console.log("snap and generate bubble", isLastRow);
      this.time.delayedCall(200, () => launcher.generateBubble());
    });

    restartPanel.on("show", () => {
      console.log("SHOW")
      launcher.setLaunchInteractive(false);
      header.counter.setPaused(true);
    });

    winPanel.on("show", () => {
      launcher.setLaunchInteractive(false);
      header.counter.setPaused(true);
    });

    puzzle.on("poppedBubbles", (isPoped: boolean, bubbles: Bubble[], isLastRow: boolean, isClear: boolean) => {
      // console.log("is clear:", isClear);
      // console.log(bubbles);
      // console.log(this.physics.world.colliders.getActive().length);
      header.scoreboard.addScore(bubbles.length * 10);
      if (isPoped) {
        header.counter.addTime(bubbles.length * 1);
        this.time.delayedCall(bubbles.length * 50, () => {
          const floatingBubbles = puzzle.dropAllFloatingBubbles();
          // console.log(floatingBubbles);
          floatingBubbles.forEach((bubbles, i) => {
            header.scoreboard.addScore(bubbles.length * 20);
            header.counter.addTime(bubbles.length * 3);
          });
        }, null, this);
      } else if (isLastRow) {
        restartPanel.show();
      }

      if (isClear) {
        winPanel.show();
      }
    });

    header.counter.on("timesUp", () => {
      launcher.setLaunchInteractive(false);
      restartPanel.show();
    });

    header.pausedButton.on("action", () => {
      this.isPaused = true;
      pauseScreen.show();
      header.counter.setPaused(true);
      launcher.setPaused(true);
    });

    pauseScreen.on("hide", () => {
      this.isPaused = false;
      header.counter.setPaused(false);
      launcher.setPaused(false);
    });

    const restartKey = this.input.keyboard.addKey("R");
    restartKey.on("up", event => {
      this.scene.restart();
    }, this);

    const pausedKey = this.input.keyboard.addKey("P");
    pausedKey.on("up", event => {
      this.scene.run((this.isPaused ? "run" : "pause"));
      this.isPaused = !this.isPaused;
    }, this);

  }

  update(): void {
    this.fpsText.setText(this.game.loop.actualFps.toFixed(1).toString());
  }
}

export default GameScene;
