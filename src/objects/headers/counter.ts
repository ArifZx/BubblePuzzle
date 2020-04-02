class Counter extends Phaser.GameObjects.Container {
  counter: number;
  counterText: Phaser.GameObjects.Text;
  timerHandler: Phaser.Time.TimerEvent;
  callbackFunc: () => void;
  isTimesUp: boolean;
  isStarted: boolean;

  private _scene: Phaser.Scene;
  private _initTime: number;

  constructor(scene: Phaser.Scene, x: number, y: number, seconds= 30) {
    const counterText = scene.add.text(x, y, `${seconds}s`, {
      color: "#FFF",
      fontSize: "64px",
      align: "left"
    });


    super(scene, x, y, [counterText]);
    this._initTime = seconds;
    this._scene = scene;
    
    this.isStarted = false;
    this.isTimesUp = false;
    this.counterText = counterText;
    this.counterText.setOrigin(0, 0.5);
    this.counter = seconds;

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

      if(!this.isTimesUp && this.counter === 0) {
        this.emit("timesUp", this);
        if(this.timerHandler) {
          this.timerHandler.remove();
        }
      }
    }

    this.counter = this._initTime;
    if(this.timerHandler) {
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
    this._initTime = seconds;
    this.counter = seconds;
    this.updateText();
  }

  start(seconds?: number) {
    if(seconds !== undefined) {
      this._initTime = seconds;
    }
    if(!this.isStarted) {
      this.isStarted = true;
      this.init(true);
    }
  }

  addTime(seconds = 0) {
    if(this.isTimesUp) {
      return;
    }
    
    this.counter += seconds;
    this.updateText();
  }

  setPaused(pause: boolean) {
    if(this.timerHandler) {
      this.timerHandler.paused = pause;
    }
  }

  resume() {
    if(this.timerHandler) {
      this.timerHandler.paused = false;
    }
  }

  updateText() {
    this.counterText.setText(`${this.counter.toFixed(0)}s`)
  }
}

export default Counter;