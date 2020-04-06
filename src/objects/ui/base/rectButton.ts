class RectButton extends Phaser.GameObjects.Container {
  text: Phaser.GameObjects.Text;
  style: Phaser.Types.GameObjects.Text.TextStyle;
  rect: Phaser.GameObjects.Rectangle;

  hoverScale: number;
  protected _initScale = 1;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    options?: {
      width?: number;
      height?: number;
      paddingWidth?: number;
      paddingHeight?: number;
      text?: string | Phaser.GameObjects.Text;
      style?: Phaser.Types.GameObjects.Text.TextStyle;
      color?: number;
      alpha?: number;
      hoverScale?: number;
    }
  ) {
    super(scene, x, y);
    const { text, style, width, height } = options || {};
    const { paddingHeight, paddingWidth, color, hoverScale } = options || {};

    if (style) {
      this.style = style;
    } else {
      this.style = {
        color: "#FFFFFF",
        fontSize: "48px"
      };
    }

    this.hoverScale = hoverScale || 1.5;

    if (typeof text === "object" && !(text instanceof Array)) {
      this.text = text;
    } else {
      this.text = new Phaser.GameObjects.Text(
        scene,
        x,
        y,
        text || "Button",
        this.style
      );
    }

    this.width =
      (width ? width : this.text.width) +
      (paddingWidth !== undefined ? paddingWidth : 16);
    this.height =
      (height ? height : this.text.height) +
      (paddingHeight !== undefined ? paddingHeight : 8);

    this.rect = new Phaser.GameObjects.Rectangle(
      scene,
      0,
      0,
      this.width,
      this.height,
      color || 0xe2a712
    );

    this.rect.setOrigin(0.5, 0.5);
    this.text.setOrigin(0.5, 0.5);
    this.rect.setDepth(this.depth);
    this.text.setDepth(this.depth + 1);
    this.rect.setPosition(0, 0);
    this.text.setPosition(0, 0);

    this.add(this.rect);
    this.add(this.text);

    this.rect
      .setInteractive()
      .on(
        "pointerover",
        () => {
          super.setScale(this.hoverScale * this._initScale);
        },
        this
      )
      .on(
        "pointerout",
        () => {
          super.setScale(this._initScale);
        },
        this
      )
      .on(
        "pointerdown",
        () => {
          this.emit("action");
        },
        this
      );

    scene.add.existing(this);
  }

  setScale(x: number, y?: number) {
    super.setScale(x, y);
    this._initScale = this.scale;
    return this;
  }
}

export default RectButton;
