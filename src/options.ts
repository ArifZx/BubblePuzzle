const options = {
  bubble: {
    color: [0x3B3433, 0xff0000, 0x0000ff, 0x00ff00, 0xffffff, 0xffff00, 0xff00ff],
    texture: {
      name: "bubble",
      location: require("./assets/bubblesprite.png").default,
      height: 180,
      width: 1080,
    },
    animation: {
      pop: "pop"
    },
    sfx: {
      blop: {
        name: "blop_sfx",
        location: require("./assets/audio/blop.mp3").default,
      }
    }
  },
  arrow: {
    texture: {
      name: "arrow",
      location: require("./assets/arrow.png").default,
      height: 300,
      width: 300,
    }
  },
  launcher: {
    sfx: {
      splat: {
        name: "splat_sfx",
        location: require("./assets/audio/splat.mp3").default
      }
    }
  },
  music: {
    loop: {
      backsound: {
        name: "backsound",
        location: [require("./assets/audio/music.mp3").default, require("./assets/audio/music.ogg").default]
      }
    }
  },
  panel: {
    texture: {
      name: "panel",
      location: require("./assets/panel.png").default,
      width: 500,
      height: 362
    }
  },
  restartButton: {
    texture: {
      name: "restart-button",
      location: require("./assets/replay.png").default,
      width: 230,
      height: 218
    }
  },
  pausedButton: {
    texture: {
      name: "paused-button",
      location: require("./assets/pause.png").default,
      width: 50,
      height: 50
    }
  }
}



export default options