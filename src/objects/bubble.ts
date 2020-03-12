import "phaser";
import options from "../options";
import GroupGlobal from "../global/groupGlobal";

class Bubble extends Phaser.Physics.Arcade.Sprite {

  context: Bubble;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, options.bubble.texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setColor(options.bubble.color[0]);
    this.setScale(options.bubble.scale);
    this.setDepth(1);
  
    this.setCircle(60, 29, 29);
    this.setCollideWorldBounds(true);
    this.setBounce(1);

    this.anims.load(options.bubble.animation.pop);

    let bubbleGroup = GroupGlobal.getGroup('bubble');
    bubbleGroup.add(this);

    scene.physics.add.collider(this, bubbleGroup, (obj1, obj2) => {
      // @ts-ignore
      obj1.stop();
      obj2.stop();
    }, null, this);
  }

  setContext(context?:Bubble) {
    this.context = context || this;
  }

  setColor(color: number, context?: Bubble) {
    this.setContext(context);

    this.context.setTint(color)
  }

  stop(context?: Bubble) {
    this.setContext(context);
    this.context.setBounce(0);
    this.context.setImmovable(true);

    this.context.setVelocity(0, 0);
  }

  setRandomColor(context?: Bubble) {
    this.setContext(context);
    
    this.context.setTint(
      options.bubble.color[
        Math.floor(Math.random() * options.bubble.color.length)
      ]
    );
  }

}

export default Bubble;
