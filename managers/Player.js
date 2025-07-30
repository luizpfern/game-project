
export default class Player {
  constructor(scene, x, y) {
    this.isJumping = false;
    this.jumpTimer = 0;
    this.maxJumpTime = 160; // ms (pulo máximo mais curto)
    this.jumpMaxVelocity = -400; // pulo máximo (ajuste aqui)
    this.jumpMinVelocity = -300; // pulo mínimo (ajuste aqui)
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
    // ...sem debug visual...
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
    // Ajuste de hitbox conforme estado
    if (!body.blocked.down) {
      this.player.setSize(18, 14);
      this.player.setOffset(7, 18);
    } else {
      this.player.setSize(18, 16);
      this.player.setOffset(7, 16);
    }
    if (this.spawning) return;
    let moving = false;

    // Suporte ao controle de Xbox/8BitDo (gamepad)
    let pad = null;
    let pads = [];
    if (this.scene.input.gamepad && this.scene.input.gamepad.total) {
      pads = this.scene.input.gamepad.gamepads.filter(gp => gp && gp.connected);
      if (pads.length > 0) pad = pads[0];
    }
    let left = (this.cursors.left && this.cursors.left.isDown) || (this.keys.left && this.keys.left.isDown);
    let right = (this.cursors.right && this.cursors.right.isDown) || (this.keys.right && this.keys.right.isDown);
    let up = (this.cursors.up && this.cursors.up.isDown) || (this.keys.up && this.keys.up.isDown);

    if (pad && pad.connected) {
      const axisH = pad.axes.length > 0 ? pad.axes[0].getValue() : 0;
      const btnA = pad.buttons[0].pressed;

      if (axisH < -0.2) {
        body.setVelocityX(-160);
        this.player.setFlipX(true);
        moving = true;
      } else if (axisH > 0.2) {
        body.setVelocityX(160);
        this.player.setFlipX(false);
        moving = true;
      }
      left = left || axisH < -0.2;
      right = right || axisH > 0.2;
      up = up || btnA;
    }

    // --- Lógica de pulo estilo Mario ---
    const jumpPressed = up;
    const jumpJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.keys.up) || (pad && pad.connected && Phaser.Input.Gamepad.JustDown(pad.buttons[0]));
    const now = this.scene.time.now;

    // Debug dos estados do pulo
    //console.log('[JUMP] pressed:', jumpPressed, '| justPressed:', jumpJustPressed, '| isJumping:', this.isJumping, '| blocked.down:', body.blocked.down, '| timer:', this.jumpTimer, '| now:', now, '| velY:', body.velocity.y);

    if (jumpJustPressed && body.blocked.down && !this.isJumping) {
      console.log('[JUMP] INICIOU PULO');
      body.setVelocityY(this.jumpMaxVelocity);
      this.isJumping = true;
      this.jumpTimer = now;
    }

    // Enquanto está pulando e botão está pressionado, permite estender o pulo
    if (this.isJumping) {
      if (jumpPressed && (now - this.jumpTimer) < this.maxJumpTime && body.velocity.y < 0) {
        console.log('[JUMP] ESTENDENDO PULO');
        body.setVelocityY(this.jumpMaxVelocity);
      } else if (!jumpPressed && body.velocity.y < 0) {
        console.log('[JUMP] CORTOU PULO', 'jumpPressed:', jumpPressed, 'velY:', body.velocity.y);
        body.setVelocityY(this.jumpMinVelocity);
        this.isJumping = false;
      } else if (body.velocity.y >= 0 || body.blocked.up) {
        if (body.velocity.y >= 0) console.log('[JUMP] Começou a cair');
        if (body.blocked.up) console.log('[JUMP] Bateu no teto');
        this.isJumping = false;
      }
    }

    // Reset de isJumping só quando aterrissar (transição de não encostado para encostado)
    if (this.wasOnGround === undefined) this.wasOnGround = body.blocked.down;
    if (!this.wasOnGround && body.blocked.down) {
      this.isJumping = false;
    }
    this.wasOnGround = body.blocked.down;

    // Movimento lateral (teclado)
    if (!pad || !pad.connected) {
      if (left) {
        body.setVelocityX(-160);
        this.player.setFlipX(true);
        moving = true;
      } else if (right) {
        body.setVelocityX(160);
        this.player.setFlipX(false);
        moving = true;
      }
    }

    // Animações
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
