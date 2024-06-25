import Phaser from 'phaser';
import Game from 'Scenes/Game';

const config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  seed: Date.now().toString(),
  scene: Game,
};

export default new Phaser.Game(config);
