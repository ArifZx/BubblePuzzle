const options = {
  bubble: {
    color: [0x3B3433, 0xff0000, 0x0000ff, 0x00ff00, 0xffffff, 0xffff00, 0xff00ff],
    texture: {
      name: 'bubble',
      location: 'assets/bubblesprite.png',
      height: 180,
      width: 1080,
    },
    animation: {
      pop: "pop"
    },
    sfx: {
      blop: {
        name: "blop_sfx",
        location: "assets/audio/blop.mp3",
      }
    }
  },
  arrow: {
    texture: {
      name: 'arrow',
      location: 'assets/arrow.png',
      height: 300,
      width: 300,
    }
  },
  launcher: {
    sfx: {
      splat: {
        name: "splat_sfx",
        location: "assets/audio/splat.mp3"
      }
    }
  },
  panel: {
    texture: {
      name: 'panel',
      location: 'assets/panel.png',
      width: 500,
      height: 362
    }
  },
  restartButton: {
    texture: {
      name: 'restart-button',
      location: 'assets/replay.png',
      width: 230,
      height: 218
    }
  }
}



export default options