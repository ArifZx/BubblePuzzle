import gameGlobal from "./gameGlobal"

type GroupKey = 'bubble'


function setupGroup(scene: Phaser.Scene, group: GroupKey): Phaser.GameObjects.Group {
  const global = gameGlobal.get();
  if(global) {
    global.group[group] = new Phaser.GameObjects.Group(scene);
  }
  return global && global.group && global.group[group];
}

function getGroup(group: GroupKey): Phaser.GameObjects.Group {
  const global = gameGlobal.get();
  return global && global.group && global.group[group]
}


const GroupGlobal = {
  getGroup,
  setupGroup
}

export default GroupGlobal;
