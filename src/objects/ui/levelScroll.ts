import LevelPanel from "./panel/levelPanel";

export default class LevelScroller extends Phaser.GameObjects.Container {
  // group of level panel
  panelGroup: Phaser.GameObjects.Group;

  // middle panel
  currentPanel: LevelPanel;
  currentPanelScale = 1.3;
  panelGap = 72;

  // Interaction pad
  touchPad: Phaser.GameObjects.Rectangle;
  startTouchPos: Phaser.Math.Vector2;

  // the middle position of level scroll
  middleX: number;
  middleY: number;

  // pointer scroll
  velocity: number;
  deceleraction: number;
  scrollX: number;
  canSroll: boolean;
  isStartTouch: boolean;

  maxLevel: number;
  releaseEvent: Phaser.Time.TimerEvent;
  scrollEvent: Phaser.Time.TimerEvent;

  private _initScrollX: number;
  private _currentScrollX: number;
  private _leftBound: number;
  private _rightBound: number;
  private _isOnTarget: boolean;

  private _scene: Phaser.Scene;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width = 0,
    height = 0,
    initLevel = 30,
  ) {
    super(scene, x, y);
    this._scene = scene;
    this.canSroll = false;

    const _width = width || (scene.game.config.width as number);
    const _height = Math.max(350, height);
    this.setSize(_width, _height);

    this.maxLevel = 100;

    this.middleX = _width * 0.5;
    this.middleY = _height * 0.5;
    this.scrollX = this.middleX;
    this.velocity = 0;
    this.deceleraction = 30;
    this._currentScrollX = this.scrollX;
    this._leftBound = this.middleX;
    this._rightBound = this._leftBound;
    this._isOnTarget = true;

    // setup touchpad
    this.touchPad = new Phaser.GameObjects.Rectangle(
      scene,
      8,
      0,
      _width - 16,
      _height,
      0xffffff,
      0.2
    );
    this.touchPad.setOrigin(0, 0);
    this.setTouchPadInteractive();
    this.add(this.touchPad);

    // setup panel group
    this.panelGroup = new Phaser.GameObjects.Group(scene, {
      createCallback: (item: LevelPanel) => {
        if (!this.currentPanel) {
          this.currentPanel = item;
          item.setScale(this.currentPanelScale);
        }

        this.remove(this.touchPad);
        this.add(item);
        this.updatePanelPosition();
        this.add(this.touchPad);

        if (this.panelGroup.getLength() > 1) {
          this._rightBound = Math.min(0, this._currentScrollX - (item.x + this.currentPanel.displayWidth * 0.5) + this.panelGap);
        }

        this.emit("createLevel", item);

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

    // init panel
    for (let i = 0; i < initLevel; i++) {
      const panel = new LevelPanel(scene);
      panel.setLevel(i + 1);
      this.panelGroup.add(panel);
    }

  }

  preUpdate() {
    if (this._currentScrollX.toFixed(1) !== this.scrollX.toFixed(1)) {
      this._isOnTarget = false;
      this.updatePanelPosition();
    } else if (!this._isOnTarget && !this.canSroll) {
      this._isOnTarget = true;
      this.updatePanelPosition();
      this.eventOnTargetPosition();
    }

    if (this.canSroll) {
      this.velocity = 0;
    }

    if (this.velocity > 0) {
      this.velocity = Math.max(0, this.velocity - this.deceleraction);
    } else if (this.velocity < 0) {
      this.velocity = Math.min(0, this.velocity + this.deceleraction);
    } else {
      this.velocity = 0;
    }

    if (!this.canSroll) {
      this.setScrollX(this.scrollX + this.velocity)
    }
  }

  setCurrentLevel(level: number | LevelPanel) {
    if (this.currentPanel) {
      this.currentPanel.setScale(1);
    }

    let panel: LevelPanel;
    if (typeof level === "number") {
      const _level = Math.min(level, this.maxLevel);
      const children = this.panelGroup.getChildren() as LevelPanel[];
      const levelPanel = children[Phaser.Math.Clamp(_level - 1, 0, children.length - 1)];

      if (levelPanel.level === _level) {
        panel = levelPanel;
      } else {
        for (let i = 0; i < children.length; i++) {
          if (children[i].level === _level) {
            panel = children[i];
            break;
          }
        }
      }
    } else if (this.panelGroup.contains(panel)) {
      panel = level;
    }

    if (panel) {
      panel.setScale(this.currentPanelScale);
      this.currentPanel = panel;
    }

    return this;
  }

  addLevel(number: number, lastPanel?: LevelPanel) {
    const last: LevelPanel = lastPanel || this.panelGroup.getLast(true);
    let startLevel = last.level + 1;
    for (let i = 0; i < 3; i++) {

      if (i + startLevel > this.maxLevel) {
        break;
      }

      const newPanel = new LevelPanel(this._scene);
      newPanel.setLevel(i + startLevel);
      this.panelGroup.add(newPanel);
    }
  }

  startTime: number;

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
          this.releaseScroll(pointer.position);
        }
      )
      .on(
        "pointerout",
        (pointer: Phaser.Input.Pointer, localX: number, localY: number) => {
          this.releaseScroll(pointer.position);
        }
      )
      .on(
        "pointermove",
        (pointer: Phaser.Input.Pointer, localX: number, localY: number) => {
          if (this.canSroll) {
            this.setScrollX(
              this._initScrollX + (pointer.x - this.startTouchPos.x) * 3
            );
            this.checkCurrentPanel();
          }
        }
      );

    return this;
  }

  eventOnTargetPosition() {
    this.checkCurrentPanel();
    this.snapPosition();
    this.autoAddLevel();
    this.emit("targetPosition", this.currentPanel);
  }

  checkCurrentPanel() {
    const middlePanel = this.getMiddlePanel();
    if (this.currentPanel && this.currentPanel.name !== middlePanel.name) {
      this.currentPanel.setScale(1);
      middlePanel.setScale(this.currentPanelScale);
      this.currentPanel = middlePanel;
      this.autoAddLevel();
    }
  }

  autoAddLevel() {
    const last: LevelPanel = this.panelGroup.getLast(true);
    if (last.level - this.level < 10) {
      this.addLevel(3, last);
    }
  }

  snapPosition(level?: LevelPanel) {
    const panel = level || this.currentPanel;
    this.setScrollX(
      Math.round(
        this._currentScrollX - (panel.x + this.currentPanel.displayWidth * 0.5 - this.middleX)
      )
    );
  }

  startScroll(position: Phaser.Math.Vector2) {
    this.isStartTouch = true;

    this.startTouchPos = position.clone();
    this._initScrollX = this._currentScrollX;

    this.startTime = Date.now();

    this.scrollEvent && this.scrollEvent.remove();
    this.scrollEvent = this._scene.time.delayedCall(333, () => {
      this.canSroll = true;
    }, null, this);
  }

  releaseScroll(position: Phaser.Math.Vector2) {
    this.scrollEvent && this.scrollEvent.remove();

    if (this.isStartTouch && !this.canSroll) {
      const endTouchPos = position.clone();
      const vectorX = (endTouchPos.x - this.startTouchPos.x) / ((Date.now() - this.startTime) * 0.005);
      this.velocity += Phaser.Math.Clamp(vectorX, -350, 350) * 3;
    }

    this.releaseEvent && this.releaseEvent.remove();
    this.releaseEvent = this._scene.time.delayedCall(
      200,
      () => this.snapPosition(),
      null,
      this
    );


    this.canSroll = false;
    this.isStartTouch = false;
  }

  setScrollX(value: number) {
    this.scrollX = Phaser.Math.Clamp(value, this._rightBound, this._leftBound);
  }

  setScrollTo(level: number) {

    const last: LevelPanel = this.panelGroup.getLast(true);
    const distance = Math.max(0, level - last.level);
    const addLevel = 1;
    const loop = Math.ceil(distance / addLevel);
    for (let i = 0; i < loop; i++) {

      this._scene.time.delayedCall(i * 200, () => {
        this.addLevel(addLevel);

        if (i === loop - 1) {
          this.setCurrentLevel(level);
          this.snapPosition();
        } else {
          const newLast: LevelPanel = this.panelGroup.getLast(true);
          if (newLast.level < level) {
            this.snapPosition(newLast);
          }
        }
      }, null, this);
    }

    if (!loop) {
      this.setCurrentLevel(level);
      this.snapPosition();
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
      0.666
    );

    if (this.currentPanel) {
      this.panelGroup.setXY(
        this._currentScrollX - this.currentPanel.displayWidth * 0.5,
        this.middleY - this.currentPanel.displayHeight * 0.5,
        this.currentPanel.displayWidth + this.panelGap
      );

      this.panelGroup.getChildren().forEach((panel: LevelPanel) => {
        if (panel.level < this.level) {
          panel.setPosition(panel.x + panel.displayWidth * (this.currentPanel.scaleX - panel.scaleX), this.middleY - panel.displayHeight * 0.5);
        } else if (panel.level > this.level) {
          panel.setPosition(panel.x, this.middleY - panel.displayHeight * 0.5);
        } else {
          panel.setPosition(panel.x, this.middleY - panel.displayHeight * 0.5);
        }
      })
    }
  }

  get level() {
    return this.currentPanel && this.currentPanel.level || 0
  }
}
