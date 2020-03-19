import "phaser"
import PreloadScene from "./scenes/preloadScene";
import GameScene from "./scenes/gameScene";

const config: Phaser.Types.Core.GameConfig = {
  title: "Puzzle Bubble",
  scale: {
    parent: "game",
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
    width: 720,
    height: 1300
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
      tileBias: 30
    }
  },
  backgroundColor: "#6A4775",
  scene: [PreloadScene, GameScene]
}

class BubblePuzzleGame extends Phaser.Game {

  global: any;

  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config);

    this.global = {
      group: {}
    }
  }
}

window.onload = () => {
  const game = new BubblePuzzleGame(config);
  window["game"] = game;
}