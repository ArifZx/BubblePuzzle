import "phaser"
import Bubble from "./objects/bubble"
import GroupGlobal from "./global/groupGlobal";

class GameScene extends Phaser.Scene {
  constructor() {
    super({
      key: "GameScene"
    })
  }

  bubble: Bubble;

  init(data): void {}

  create(): void {

    GroupGlobal.setupGroup(this, 'bubble');
  
    this.bubble = new Bubble(this, 100, 100);
    this.bubble.setVelocity(1000, 300);

    let bubble = new Bubble(this, 100, 500);
    // bubble.setVelocity(200, 1000);

    let bubble2 = new Bubble(this, 100, 200);
    // bubble2.setVelocity(1213, 1233);

    // this.physics.add.collider()
  }
}

export default GameScene