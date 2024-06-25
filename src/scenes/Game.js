import Phaser from 'phaser';
import Level from 'Scenes/Level';

function phaseLevelSet(data, separator = 0x0a) {
  const lines = data.split(String.fromCharCode(separator));
  const levelSet = [];
  let level = [];
  for (let i = 0; i < lines.length; i += 1) {
    if (!lines[i].startsWith(';') && !lines[i].startsWith('-')) {
      if (lines[i].length !== 0) {
        level.push(lines[i]);
      }
    } else if (lines[i].startsWith('-')) {
      if (level.length !== 0) {
        levelSet.push(level);
        level = [];
      }
    }
  }
  return levelSet;
}

export default class Game extends Phaser.Scene {
  constructor() {
    super({ key: 'Game', active: true });
  }

  getInitData() {
    return {
      level: this.data.get('levelSet')[this.data.get('level')],
      tileWidth: 128,
      tileHeight: 128,
      frames: {
        floor: 89,
        boxFloor: 102,
        goal: 40,
        wall: 84,
        box: 1,
        boxOnGoal: 14,
        player: {
          down: [52, 53, 54],
          up: [55, 56, 57],
          right: [78, 79, 80],
          left: [81, 82, 83],
        },
      },
    };
  }

  preload() {
    this.load.text('levelSet', '/assets/level-set/Sokoban.txt');
    this.load.spritesheet(
      'tileSheet',
      '/assets/tile-sheet/128x128.png',
      {
        frameWidth: 128,
        frameHeight: 128,
      },
    );
  }

  update() {
    const levelScene = this.scene.get('Level');
    const levelSet = this.data.get('levelSet');
    const level = this.data.get('level');
    if (levelScene.isWin()) {
      this.data.set({
        level: level + 1 < levelSet.length ? level + 1 : 0,
      });
      this.scene.stop('Level');
      this.scene.launch('Level', this.getInitData());
    }
  }

  create() {
    this.data.set({
      levelSet: phaseLevelSet(this.cache.text.get('levelSet')),
      level: 0,
    });
    this.scene.add(
      'Level',
      Level,
      true,
      this.getInitData(),
    );
  }
}
