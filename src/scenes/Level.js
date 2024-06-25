import Phaser from 'phaser';

export default class Level extends Phaser.Scene {
  init(data) {
    const speed = typeof data.speed === 'number' && data.speed !== 1 ? data.speed : 1;
    const { level } = data;
    const wallMap = new Map();
    const boxMap = new Map();
    const goalMap = new Map();
    const height = level.length;
    let width = 0;
    let player;
    for (let y = 0; y < level.length; y += 1) {
      if (width < level[y].length) {
        width = level[y].length;
      }
      for (let x = 0; x < level[y].length; x += 1) {
        switch ((level[y][x]).charCodeAt(0)) {
          case 0x23: // wall
            wallMap.set(`${x}-${y}`, { x, y });
            break;
          case 0x40: // player
            player = { x, y };
            break;
          case 0x2b: // player on goal
            player = { x, y };
            goalMap.set(`${x}-${y}`, { x, y });
            break;
          case 0x24: // box
            boxMap.set(`${x}-${y}`, { x, y });
            break;
          case 0x2a: // box on goal
            boxMap.set(`${x}-${y}`, { x, y });
            goalMap.set(`${x}-${y}`, { x, y });
            break;
          case 0x2e: // goal
            goalMap.set(`${x}-${y}`, { x, y });
            break;
          default:
            break;
        }
      }
    }
    this.data.set({
      ...data,
      duration: 400,
      frameRate: 12,
      speed,
      size: { width, height },
      player,
      wallMap,
      boxMap,
      goalMap,
      history: [],
    });
  }

  createFloor() {
    const tileWidth = this.data.get('tileWidth');
    const tileHeight = this.data.get('tileHeight');
    const frames = this.data.get('frames');
    const size = this.data.get('size');
    this.floorMap = new Map();
    for (let y = 0; y < size.height; y += 1) {
      for (let x = 0; x < size.width; x += 1) {
        const hasBox = this.data.get('boxMap').has(`${x}-${y}`);
        const s = this.add.sprite(x * tileWidth, y * tileHeight, 'tileSheet', hasBox ? frames.boxFloor : frames.floor)
          .setOrigin(0, 0)
          .setDepth(0)
          .setData({ x, y });
        this.floorMap.set(`${x}-${y}`, s);
      }
    }
  }

  createGoal() {
    const tileWidth = this.data.get('tileWidth');
    const tileHeight = this.data.get('tileHeight');
    const frames = this.data.get('frames');
    this.goalMap = new Map();
    this.data.get('goalMap').forEach((v, k) => {
      const s = this.add.sprite(v.x * tileWidth, v.y * tileHeight, 'tileSheet', frames.goal)
        .setOrigin(0, 0)
        .setDepth(1)
        .setData({ x: v.x, y: v.y });
      this.goalMap.set(k, s);
    });
  }

  createBox() {
    const tileWidth = this.data.get('tileWidth');
    const tileHeight = this.data.get('tileHeight');
    const frames = this.data.get('frames');
    this.boxMap = new Map();
    this.data.get('boxMap').forEach((v, k) => {
      const bOg = this.data.get('goalMap').has(v);
      const s = this.add.sprite(v.x * tileWidth, v.y * tileHeight, 'tileSheet', bOg ? frames.boxOnGoal : frames.box)
        .setOrigin(0, 0)
        .setDepth(2)
        .setData({ x: v.x, y: v.y });
      this.boxMap.set(k, s);
    });
  }

  createWall() {
    const tileWidth = this.data.get('tileWidth');
    const tileHeight = this.data.get('tileHeight');
    const frames = this.data.get('frames');
    this.wallMap = new Map();
    this.data.get('wallMap').forEach((v, k) => {
      const s = this.add.sprite(v.x * tileWidth, v.y * tileHeight, 'tileSheet', frames.wall)
        .setOrigin(0, 0)
        .setDepth(3)
        .setData({ x: v.x, y: v.y });
      this.wallMap.set(k, s);
    });
  }

  createPlayer() {
    const tileWidth = this.data.get('tileWidth');
    const tileHeight = this.data.get('tileHeight');
    const frames = this.data.get('frames');
    const player = this.data.get('player');
    this.player = this.add
      .sprite(player.x * tileWidth, player.y * tileHeight, 'tileSheet', frames.player.down[0]) // Default to down[0]
      .setOrigin(0, 0)
      .setDepth(2)
      .setData({ x: player.x, y: player.y });
    const frameRate = this.data.get('frameRate') * this.data.get('speed');
    this.anims.create({
      key: 'down',
      frames: this.anims.generateFrameNumbers(
        'tileSheet',
        { frames: frames.player.down },
      ),
      frameRate,
      repeat: -1,
    });
    this.anims.create({
      key: 'up',
      frames: this.anims.generateFrameNumbers(
        'tileSheet',
        { frames: frames.player.up },
      ),
      frameRate,
      repeat: -1,
    });
    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers(
        'tileSheet',
        { frames: frames.player.right },
      ),
      frameRate,
      repeat: -1,
    });
    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers(
        'tileSheet',
        { frames: frames.player.left },
      ),
      frameRate,
      repeat: -1,
    });
    this.player.anims.load('down');
    this.player.anims.load('up');
    this.player.anims.load('right');
    this.player.anims.load('left');
  }

  createKeyboardControl() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.zKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
  }

  create() {
    // Create game objects
    this.createFloor();
    this.createGoal();
    this.createBox();
    this.createWall();
    this.createPlayer();
    this.createKeyboardControl();
    // Fit GameSize to current level
    const tileWidth = this.data.get('tileWidth');
    const tileHeight = this.data.get('tileHeight');
    const size = this.data.get('size');
    this.scale.setGameSize(size.width * tileWidth, size.height * tileHeight);
  }

  isMoving() {
    return this.data.get('movingPlayer') || this.data.get('movingBox');
  }

  isWin() {
    return [...this.boxMap.keys()].every((k) => this.goalMap.has(k));
  }

  update() {
    if (this.isWin()) {
      // stop KeyboardControl...
    } else if (this.cursors.left.isDown) {
      this.movePlayer('left');
    } else if (this.cursors.right.isDown) {
      this.movePlayer('right');
    } else if (this.cursors.up.isDown) {
      this.movePlayer('up');
    } else if (this.cursors.down.isDown) {
      this.movePlayer('down');
    } else if (Phaser.Input.Keyboard.JustDown(this.zKey)) {
      this.undo();
    }
  }

  movePlayer(direction) {
    if (this.isMoving()) return;
    const tileWidth = this.data.get('tileWidth');
    const tileHeight = this.data.get('tileHeight');
    const from = {
      x: this.player.getData('x'),
      y: this.player.getData('y'),
    };
    const to = {
      x: from.x,
      y: from.y,
    };
    switch (direction) {
      case 'up':
        to.y -= 1;
        break;
      case 'down':
        to.y += 1;
        break;
      case 'left':
        to.x -= 1;
        break;
      case 'right':
        to.x += 1;
        break;
      default:
        return;
    }
    if (this.boxMap.has(`${to.x}-${to.y}`)) {
      this.moveBox(this.boxMap.get(`${to.x}-${to.y}`), direction);
    } else if (!this.wallMap.has(`${to.x}-${to.y}`)) {
      this.tweens.add({
        targets: this.player,
        x: to.x * tileWidth,
        y: to.y * tileHeight,
        duration: Math.ceil(this.data.get('duration') / this.data.get('speed')),
        onStart: () => {
          this.data.set({ movingPlayer: true });
          this.player.anims.play(direction, true);
        },
        onComplete: () => {
          this.player.anims.stop();
          this.player.anims.setProgress(0);
          this.data.get('history').push({
            type: 'player',
            from,
            to,
          });
          this.player.setData({ x: to.x, y: to.y });
          this.data.set({ movingPlayer: false });
        },
      });
    }
  }

  moveBox(box, direction) {
    if (this.isMoving()) return;
    const tileWidth = this.data.get('tileWidth');
    const tileHeight = this.data.get('tileHeight');
    const from = {
      x: box.getData('x'),
      y: box.getData('y'),
    };
    const to = {
      x: from.x,
      y: from.y,
    };
    switch (direction) {
      case 'up':
        to.y -= 1;
        break;
      case 'down':
        to.y += 1;
        break;
      case 'left':
        to.x -= 1;
        break;
      case 'right':
        to.x += 1;
        break;
      default:
        return;
    }
    if (!this.wallMap.has(`${to.x}-${to.y}`) && !this.boxMap.has(`${to.x}-${to.y}`)) {
      this.tweens.addMultiple([
        {
          targets: box,
          x: to.x * tileWidth,
          y: to.y * tileHeight,
          duration: Math.ceil(this.data.get('duration') / this.data.get('speed')),
          onStart: () => this.data.set({ movingBox: true }),
          onComplete: () => {
            box.setData({ x: to.x, y: to.y });
            if (this.goalMap.has(`${to.x}-${to.y}`)) {
              box.setFrame(this.data.get('frames').boxOnGoal);
            } else {
              box.setFrame(this.data.get('frames').box);
            }
            this.boxMap.delete(`${from.x}-${from.y}`);
            this.boxMap.set(`${to.x}-${to.y}`, box);
            this.data.set({ movingBox: false });
          },
        },
        {
          targets: this.player,
          x: from.x * tileWidth,
          y: from.y * tileHeight,
          duration: Math.ceil(this.data.get('duration') / this.data.get('speed')),
          onStart: () => {
            this.data.set({ movingPlayer: true });
            this.player.anims.play(direction, true);
          },
          onComplete: () => {
            this.player.anims.stop();
            this.player.anims.setProgress(0);
            this.data.get('history').push({
              type: 'box',
              from,
              to,
              player: {
                from: {
                  x: this.player.getData('x'),
                  y: this.player.getData('y'),
                },
                to: {
                  x: from.x,
                  y: from.y,
                },
              },
            });
            this.player.setData({ x: from.x, y: from.y });
            this.data.set({ movingPlayer: false });
          },
        },
      ]);
    }
  }

  undo() {
    if (this.isMoving()) return;
    const h = this.data.get('history').pop();
    if (h === undefined) return;
    const tileWidth = this.data.get('tileWidth');
    const tileHeight = this.data.get('tileHeight');
    if (h.type === 'player') {
      this.data.set({ movingPlayer: true });
      this.player
        .setPosition(h.from.x * tileWidth, h.from.y * tileHeight)
        .setData({ x: h.from.x, y: h.from.y });
      this.data.set({ movingPlayer: false });
    } else if (h.type === 'box') {
      this.data.set({ movingPlayer: true });
      this.player
        .setPosition(h.player.from.x * tileWidth, h.player.from.y * tileHeight)
        .setData({ x: h.player.from.x, y: h.player.from.y });
      this.data.set({ movingPlayer: false });

      this.data.set({ movingBox: true });
      const b = this.boxMap
        .get(`${h.to.x}-${h.to.y}`)
        .setPosition(h.from.x * tileWidth, h.from.y * tileHeight)
        .setData({ x: h.from.x, y: h.from.y });
      if (this.goalMap.has(`${h.from.x}-${h.from.y}`)) {
        b.setFrame(this.data.get('frames').boxOnGoal);
      } else {
        b.setFrame(this.data.get('frames').box);
      }
      this.boxMap.delete(`${h.to.x}-${h.to.y}`);
      this.boxMap.set(`${h.from.x}-${h.from.y}`, b);
      this.data.set({ movingBox: false });
    }
  }
}
