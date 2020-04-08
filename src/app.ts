import { Types, Scale, Game } from "phaser"
import PreloadScene from "./scenes/preloadScene";
import GameScene from "./scenes/gameScene";
import MenuScene from "./scenes/menuScene";

const config: Types.Core.GameConfig = {
  title: "Puzzle Bubble",
  scale: {
    parent: "game",
    mode: Scale.FIT,
    autoCenter: Scale.CENTER_HORIZONTALLY,
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
  scene: [PreloadScene, MenuScene, GameScene],
}

let game: Game;

class BubblePuzzleGame extends Game {

  global: any;

  constructor(config: Types.Core.GameConfig) {
    super(config);

    this.global = {
      group: {}
    }
  }
}

function startGame() {
  document.getElementById("loading") && document.getElementById("loading").remove();
  if (!game) {
    game = new BubblePuzzleGame(config);
  }

  // window["game"] = game;
}


window.onload = () => {
  startGame()
}

// RUN GAME after 100ms
// setTimeout(() => {
//   startGame();
// }, 100);