import LevelPanel from "./panel/levelPanel";

export default class LevelScroller extends Phaser.GameObjects.Container {
  panelGroup: Phaser.GameObjects.Group;
  currentPanel: LevelPanel;

  touchPad: Phaser.GameObjects.Rectangle;
  startTouchPos: Phaser.Math.Vector2;

  middleX: number;
  middleY: number;

  scrollX: number;
  canSroll: boolean;

  releaseEvent: Phaser.Time.TimerEvent;

  private _initScrollX: number;
  private _currentScrollX: number;
  private _leftBound: number;
  private _rightBound: number;

  private _scene: Phaser.Scene;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width = 0,
    height = 0
  ) {
    super(scene, x, y);
    this._scene = scene;
    this.canSroll = false;

    const _width = width || (scene.game.config.width as number);
    const _height = Math.max(250, height);
    this.setSize(_width, _height);

    this.middleX = _width * 0.5;
    this.middleY = _height * 0.5;
    this.scrollX = this.middleX;
    this._currentScrollX = this.scrollX;
    this._leftBound = this.middleX;
    this._rightBound = this._leftBound;

    this.touchPad = new Phaser.GameObjects.Rectangle(
      scene,
      5,
      0,
      _width - 10,
      _height,
      0xffffff,
      0
    );
    this.touchPad.setOrigin(0, 0);
    this.setTouchPadInteractive();
    this.add(this.touchPad);

    this.panelGroup = new Phaser.GameObjects.Group(scene, {
      createCallback: (item: LevelPanel) => {
        this.remove(this.touchPad);
        this.add(item);
        this.updatePanelPosition();
        this.add(this.touchPad);
        if (this.panelGroup.getLength() > 1) {
          this._rightBound = Math.min(0, this._leftBound - item.x + 60 + 150);
        }

        if (!this.currentPanel) {
          this.currentPanel = item;
        }
      },
      removeCallback: (item) => {
        this.remove(item);
        let max = 0;
        this.panelGroup.getChildren().forEach((panel: LevelPanel) => {
          if (panel.x >= max) {
            max = panel.x;
          }
        });

        this._rightBound = max;
      },
    });

    const n = 10;
    for (let i = 0; i < n; i++) {
      const panel = new LevelPanel(scene);
      panel.setLevel(i + 1);
      this.panelGroup.add(panel);
    }
  }

  preUpdate() {
    if (this._currentScrollX.toFixed(1) !== this.scrollX.toFixed(1)) {
      this.updatePanelPosition();
    }
  }

  setTouchPadInteractive(active = true) {
    if (!active) {
      this.touchPad.removeInteractive();
      return this;
    }

    this.touchPad
      .setInteractive()
      .on(
        "pointerdown",
        (pointer: Phaser.Input.Pointer, localX: number, localY: number) => {
          this.startScroll(pointer.position);
        }
      )
      .on(
        "pointerup",
        (pointer: Phaser.Input.Pointer, localX: number, localY: number) => {
          this.releaseScroll();
        }
      )
      .on(
        "pointerout",
        (pointer: Phaser.Input.Pointer, localX: number, localY: number) => {
          this.releaseScroll();
        }
      )
      .on(
        "pointermove",
        (pointer: Phaser.Input.Pointer, localX: number, localY: number) => {
          if (this.canSroll) {
            this.setScrollX(
              this._initScrollX + (pointer.x - this.startTouchPos.x)
            );
            this.checkCurrentPanel();
          }
        }
      );

    return this;
  }

  checkCurrentPanel() {
    const middlePanel = this.getMiddlePanel();
    if (this.currentPanel.name !== middlePanel.name) {
      this.currentPanel = middlePanel;
    }
  }

  startScroll(position: Phaser.Math.Vector2) {
    this.canSroll = true;
    this.startTouchPos = position.clone();
    this._initScrollX = this._currentScrollX;
  }

  snapPosition() {
    this.setScrollX(
      Math.round(
        this._currentScrollX - (this.currentPanel.x + 150 - this.middleX)
      )
    );
  }

  releaseScroll() {
    this.canSroll = false;

    this.releaseEvent && this.releaseEvent.remove();
    this.releaseEvent = this._scene.time.delayedCall(
      100,
      () => this.snapPosition(),
      null,
      this
    );
  }

  setScrollX(value: number) {
    this.scrollX = Phaser.Math.Clamp(value, this._rightBound, this._leftBound);
  }

  setScrollTo(level: number) {
    const children = this.panelGroup.getChildren() as LevelPanel[];
    const levelPanel = children[Math.max(0, level - 1)];

    if (levelPanel.level === level) {
      this.currentPanel = levelPanel;
      this.setScrollX(
        Math.round(
          this._currentScrollX - (this.currentPanel.x + 150 - this.middleX)
        )
      );
      return this;
    }

    for (let i = 0; i < children.length; i++) {
      if (children[i].level === level) {
        this.currentPanel = children[i];
        this.setScrollX(
          Math.round(
            this._currentScrollX - (this.currentPanel.x + 150 - this.middleX)
          )
        );
        return this;
      }
    }

    return this;
  }

  getMiddlePanel() {
    return this.getShortestPanel(this.middleX, this.middleY);
  }

  getShortestPanel(x: number, y?: number) {
    const point = new Phaser.Math.Vector2(x - this.x - 150, (y || x) - this.y);
    let selectedPanel: LevelPanel;
    let minDistance = Number.MAX_SAFE_INTEGER;

    this.panelGroup.getChildren().forEach((panel: LevelPanel) => {
      const distance = point.distance(
        new Phaser.Math.Vector2(panel.x, panel.y)
      );
      if (distance <= minDistance) {
        minDistance = distance;
        selectedPanel = panel;
      }
    });
    return selectedPanel;
  }

  updatePanelPosition() {
    this._currentScrollX = Phaser.Math.Linear(
      this._currentScrollX,
      this.scrollX,
      0.6
    );
    this.panelGroup.setXY(
      -150 + this._currentScrollX,
      this.middleY - 125,
      300 + 60
    );
  }
}
