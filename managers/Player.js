
export default class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    this.spawning = true;
    this.player = scene.physics.add.sprite(x, y, 'nico');
    this.createAnimations();
    this.player.anims.play('spawn');
    this.player.once(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + 'spawn', () => {
      this.spawning = false;
      this.player.anims.play('idle');
    });
    this.player.setScale(3);
    this.player.setSize(18, 16);
    this.player.setOffset(7, 16);
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0);
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.keys = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });
  }

  static preload(scene) {
    scene.load.spritesheet('nico', 'assets/sprites/nico.png', {
      frameWidth: 32,
      frameHeight: 32
    });
  }

  createAnimations() {
    this.scene.anims.create({
      key: 'spawn',
      frames: this.scene.anims.generateFrameNumbers('nico', { start: 700, end: 709 }),
      frameRate: 10,
      repeat: 0
    });
    this.scene.anims.create({
      key: 'idle',
      frames: this.scene.anims.generateFrameNumbers('nico', { start: 70, end: 77 }),
      frameRate: 12,
      repeat: -1
    });
    this.scene.anims.create({
      key: 'walk',
      frames: this.scene.anims.generateFrameNumbers('nico', { start: 400, end: 403 }),
      frameRate: 12,
      repeat: -1
    });
    this.scene.anims.create({
      key: 'jump',
      frames: [ { key: 'nico', frame: 250 } ],
      frameRate: 1,
      repeat: -1
    });
    this.scene.anims.create({
      key: 'fall',
      frames: [ { key: 'nico', frame: 385 } ],
      frameRate: 1,
      repeat: -1
    });
  }

  update() {
    const body = this.player.body;
    body.setVelocityX(0);
    if (!body.blocked.down) {
      this.player.setSize(18, 14);
      this.player.setOffset(7, 18);
    } else {
      this.player.setSize(18, 16);
      this.player.setOffset(7, 16);
    }
    if (this.spawning) return;
    let moving = false;
    if (this.cursors.left.isDown || this.keys.left.isDown) {
      body.setVelocityX(-160);
      this.player.setFlipX(true);
      moving = true;
    } else if (this.cursors.right.isDown || this.keys.right.isDown) {
      body.setVelocityX(160);
      this.player.setFlipX(false);
      moving = true;
    }
    if ((this.cursors.up.isDown || this.keys.up.isDown) && body.blocked.down) {
      body.setVelocityY(-480);
    }
    if (!body.blocked.down) {
      if (body.velocity.y < 0) {
        this.player.anims.play('jump', true);
      } else {
        this.player.anims.play('fall', true);
      }
    } else if (moving && body.velocity.x !== 0) {
      this.player.anims.play('walk', true);
    } else {
      this.player.anims.play('idle', true);
    }
  }
}
