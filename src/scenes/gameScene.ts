import "phaser";
import Bubble from "../objects/bubble";
import PuzzleManager from "../objects/puzzleManager";
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

  // Panel
  restartPanel: ActionPanel;
  winPanel: ActionPanel;
  pauseScreen: PauseScreen;

  // Game
  header: Header;
  puzzle: PuzzleManager;
  launcher: BubbleLauncher;

  // music
  music: Phaser.Sound.BaseSound;

  constructor() {
    super({
      key: "GameScene"
    });

    this.godMode = false;
    this.isPaused = false;
  }

  init(data): void { 
    
    const { height, width } = this.game.config;
    const w = width as number;
    const h = height as number;

    this.restartPanel = new ActionPanel(this, w * 0.5, h * 0.5, "Game Over");
    this.winPanel = new ActionPanel(this, w * 0.5, h * 0.5, "You Win");
    this.pauseScreen = new PauseScreen(this);
    this.header = new Header(this, 0, 0);
    this.puzzle = new PuzzleManager(this, 0, 45, w);
    this.launcher = new BubbleLauncher(this, w * 0.5, h * 0.8, this.puzzle);

    this.fpsText = new Phaser.GameObjects.Text(this, 0, (height as number) - 50, "00", {
      color: "#FFFFFF",
      fontSize: "48px"
    });

    this.music = this.sound.add(options.music.loop.backsound.name, {loop: true});
    
  }

  preload(): void {
    this.cheatSFX = this.sound.add(options.bubble.sfx.blop.name);
  }

  create(): void {
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

    this.music.play();

    this.header.setDepth(3);
    this.puzzle.setDepth(2);


    this.restartPanel.on("action", () => {
      this.music.stop();
      this.scene.restart();
    });

    this.winPanel.on("action", () => {
      this.music.stop();
      this.scene.restart();
    });

    this.restartPanel.on("show", () => {
      this.launcher.setLaunchInteractive(false);
      this.header.counter.setPaused(true);
    });

    this.winPanel.on("show", () => {
      this.launcher.setLaunchInteractive(false);
      this.header.counter.setPaused(true);
    });

    this.header.counter.setTime(45);

    this.puzzle.generateBubbles();

    this.fpsText.setDepth(5);

    this.add.existing(this.fpsText);

    // FOR DEBUG
    this.input.on(
      "pointerdown",
      pointer => {

        if (!this.godMode) {
          return;
        }

        const rowCol = this.puzzle.getRowCol(pointer.x, pointer.y);
        const bubble = this.puzzle.getBubbleByRowCol(rowCol);
        if (bubble) {
          this.puzzle.snapBubble(bubble, null, 1, true);
          console.log(this.puzzle.getBubbleRowCol(bubble));
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
      this.launcher.setLaunchInteractive();
    }, null, this);

    this.launcher.on("launchedBubble", (bubble: Bubble) => {
      // console.log("launch");
      this.puzzle.setLaunchBubble(bubble);
      this.header.counter.start();
    });

    this.puzzle.on("snapBubble", (bubble: Bubble) => {
      this.time.delayedCall(200, () => this.launcher.generateBubble());
    });

    this.sound.volume = 1;

    this.puzzle.on("poppedBubbles", (isPoped: boolean, bubbles: Bubble[], isCrossBorderLine: boolean, isClear: boolean) => {
      // console.log("is clear:", isClear);
      // console.log(bubbles);
      // console.log(this.physics.world.colliders.getActive().length);
      this.header.scoreboard.addScore(bubbles.length * 10);
      if (isPoped) {
        this.header.counter.addTime(bubbles.length * 1);
        this.time.delayedCall(bubbles.length * 50, () => {
          const floatingBubbles = this.puzzle.dropAllFloatingBubbles();
          // console.log(floatingBubbles);
          floatingBubbles.forEach((bubbles, i) => {
            this.header.scoreboard.addScore(bubbles.length * 20);
            this.header.counter.addTime(bubbles.length * 3);
          });
        }, null, this);
      } else if (isCrossBorderLine) {
        this.restartPanel.show();
      }

      if (isClear) {
        this.winPanel.show();
      }
    });

    this.header.counter.on("timesUp", () => {
      this.launcher.setLaunchInteractive(false);
      this.restartPanel.show();
    });

    this.header.pausedButton.on("action", () => {
      this.isPaused = true;
      this.pauseScreen.show();
      this.header.counter.setPaused(true);
      this.launcher.setPaused(true);
      this.music.pause();
    });

    this.pauseScreen.on("hide", () => {
      this.isPaused = false;
      this.header.counter.setPaused(false);
      this.launcher.setPaused(false);
      this.music.resume();
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
