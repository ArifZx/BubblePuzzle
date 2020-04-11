class Counter extends Phaser.GameObjects.Container {
  counter: number;
  counterText: Phaser.GameObjects.Text;
  timerHandler: Phaser.Time.TimerEvent;
  callbackFunc: () => void;
  isTimesUp: boolean;
  isStarted: boolean;

  private _scene: Phaser.Scene;
  private _initTime: number;

  constructor(scene: Phaser.Scene, x: number, y: number, seconds = 30) {
    const _seconds = Math.min(seconds, 99);
    const counterText = scene.add.text(x, y, `${_seconds}s`, {
      color: "#FFF",
      fontSize: "64px",
      align: "left"
    });


    super(scene, x, y, [counterText]);
    this._scene = scene;
    this._initTime = _seconds;

    this.isStarted = false;
    this.isTimesUp = false;
    this.counterText = counterText;
    this.counterText.setOrigin(0, 0.5);
    this.counter = _seconds;

    scene.add.existing(this);
  }

  setCallback(callbackFunc: () => void) {
    this.callbackFunc = callbackFunc;
  }

  init(isStart = false) {
    this.isStarted = isStart;
    this.callbackFunc = () => {
      this.counter = Math.max(0, this.counter - 1);
      this.updateText();

      if (!this.isTimesUp && this.counter === 0) {
        this.emit("timesUp", this);
        if (this.timerHandler) {
          this.timerHandler.remove();
        }
      }
    }

    this.counter = this._initTime;
    if (this.timerHandler) {
      this.timerHandler.remove();
    }

    this.timerHandler = this._scene.time.addEvent({
      repeat: -1,
      delay: 1000,
      callbackScope: this,
      callback: this.callbackFunc
    });
  }

  setTime(seconds = 30) {
    this._initTime = Math.min(seconds, 99);
    this.counter = this._initTime;
    this.updateText();
  }

  start(seconds?: number) {
    if (seconds !== undefined) {
      this._initTime = seconds;
    }
    if (!this.isStarted) {
      this.isStarted = true;
      this.init(true);
    }
  }

  addTime(seconds = 0) {
    if (this.isTimesUp) {
      return;
    }

    this.counter = Math.min(this.counter + seconds, 99);
    this.updateText();
  }

  setPaused(pause: boolean) {
    if (this.timerHandler) {
      this.timerHandler.paused = pause;
    }
  }

  resume() {
    if (this.timerHandler) {
      this.timerHandler.paused = false;
    }
  }

  updateText() {
    this.counterText && this.counterText.setText(`${this.counter.toFixed(0)}s`)
  }
}

export default Counter;