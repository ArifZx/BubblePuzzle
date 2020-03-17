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
  }
}



export default options