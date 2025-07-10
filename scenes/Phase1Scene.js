import platformsMap from './platformsMap.js';

export default class Phase1Scene extends Phaser.Scene {
  constructor() {
    super('Phase1Scene');
  }

  preload() {
    // carrega o novo mapa e tileset
    this.load.tilemapTiledJSON('mapa', 'assets/world/untitled.json');
    this.load.image('tiles', 'assets/world/tiles and background_foreground (new)/tileset_32x32(new).png');

    // Carrega o sprite do personagem principal como spritesheet (ajuste frameWidth/frameHeight conforme seu sprite)
    this.load.spritesheet('nico', 'assets/sprites/nico.png', {
      frameWidth: 32, // ajuste para o tamanho real do frame do seu sprite
      frameHeight: 32 // ajuste para o tamanho real do frame do seu sprite
    });
    // Carrega as imagens de fundo para parallax
    this.load.image('bg_0', 'assets/world/bg_0.png');
    this.load.image('bg_1', 'assets/world/bg_1.png');
  }

  create() {
    // Flag para controle de surgimento
    this.spawning = true;

    // Fundo parallax (agora ANTES do mapa)
    const bg0Tex = this.textures.get('bg_0').getSourceImage();
    const bg1Tex = this.textures.get('bg_1').getSourceImage();
    const screenH = this.cameras.main.height;
    // Valores temporários para largura do mapa, substituídos depois
    let tempMapWidth = 3000;
    const scale0 = screenH / bg0Tex.height;
    const scale1 = screenH / bg1Tex.height;
    const scaledBg0Width = bg0Tex.width * scale0;
    const scaledBg1Width = bg1Tex.width * scale1;
    const repeatCount0 = Math.ceil(tempMapWidth / scaledBg0Width);
    const repeatCount1 = Math.ceil(tempMapWidth / scaledBg1Width);
    this.bg0s = [];
    this.bg1s = [];
    for (let i = 0; i < repeatCount0; i++) {
      const bg0 = this.add.image(i * scaledBg0Width, 0, 'bg_0').setOrigin(0, 0).setScrollFactor(0.2);
      bg0.setScale(scale0);
      this.bg0s.push(bg0);
    }
    for (let i = 0; i < repeatCount1; i++) {
      const bg1 = this.add.image(i * scaledBg1Width, 0, 'bg_1').setOrigin(0, 0).setScrollFactor(0.5);
      bg1.setScale(scale1);
      this.bg1s.push(bg1);
    }
    this.cameras.main.setBackgroundColor('#fff');
    this.playerIsDead = false;

    // --- MAPA DO TILED ---
    // Cria o tilemap
    const map = this.make.tilemap({ key: 'mapa' });
    // O nome do tileset deve ser igual ao nome do tileset no Tiled (aqui: 'ground')
    const tileset = map.addTilesetImage('ground', 'tiles');
    // Ajuste o nome da camada conforme está no seu untitled.json (ex: 'Tile Layer 1', 'ground', etc)
    const layer = map.createLayer('Tile Layer 1', tileset, 0, 0);

    // Ativa colisão para tiles marcados como colidíveis no Tiled
    const result = layer.setCollisionByProperty({ collides: true });


    // Ajusta limites do mundo para o tamanho do mapa
    this.mapWidth = map.widthInPixels;
    this.mapHeight = map.heightInPixels;

    // --- COLISÃO DO PLAYER COM O MAPA ---
    // Plataformas agora são o layer do tilemap
    this.platforms = layer;


    // Animações do personagem (ajuste os frames conforme seu spritesheet)
    // Animação de surgimento (ajuste os frames conforme seu spritesheet)
    this.anims.create({
      key: 'spawn',
      frames: this.anims.generateFrameNumbers('nico', { start: 700, end: 709 }), // ajuste se necessário
      frameRate: 10,
      repeat: 0
    });
    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('nico', { start: 70, end: 77 }),
      frameRate: 12,
      repeat: -1
    });
    this.anims.create({
      key: 'walk',
      frames: this.anims.generateFrameNumbers('nico', { start: 400, end: 403 }),
      frameRate: 12,
      repeat: -1
    });
    this.anims.create({
      key: 'jump',
      frames: [ { key: 'nico', frame: 250 } ],
      frameRate: 1,
      repeat: -1
    });
    this.anims.create({
      key: 'fall',
      frames: [ { key: 'nico', frame: 385 } ],
      frameRate: 1,
      repeat: -1
    });

    // Player (sprite)
    this.player = this.physics.add.sprite(100, 435, 'nico');
    this.player.anims.play('spawn'); // Começa com animação de surgimento
    this.player.once(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + 'spawn', () => {
      this.spawning = false;
      this.player.anims.play('idle');
    });
    this.player.setScale(3); // Dobra o tamanho mantendo a proporção
    // Ajusta o hitbox para coincidir com o sprite (32x32, escalado para 64x64)
    this.player.setSize(18, 16); // hitbox menor para o corpo do gato
    this.player.setOffset(7, 16); // centraliza e desce a hitbox
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0); // Sem bounce ao cair

    // ...removido debug da hitbox...

    // Colisão com plataformas
    this.physics.add.collider(this.player, this.platforms);

    // Controles
    this.cursors = this.input.keyboard.createCursorKeys();
    // Adiciona suporte ao WASD
    this.keys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // Moedas (círculos amarelos) em posições fiéis ao desenho
    this.coins = this.physics.add.staticGroup();
    const coinPositions = [
      { x: 460, y: 500 }, // plataforma baixa esquerda
      { x: 570, y: 420 }, // escada
      { x: 670, y: 340 }, // topo da escada
      { x: 900, y: 320 }, // plataforma aérea
      { x: 1050, y: 300 },
      { x: 1200, y: 280 },
      { x: 950, y: 240 }, // plataforma longa superior
      { x: 1100, y: 240 },
      { x: 1250, y: 240 },
      { x: 1450, y: 360 }, // descendo
      { x: 1700, y: 540 }, // bloco central
      { x: 2150, y: 400 }, // plataforma alta do inimigo grande
      { x: 2470, y: 540 }  // final
    ];
    coinPositions.forEach(pos => {
      const coin = this.add.circle(pos.x, pos.y, 10, 0xffd700);
      this.coins.add(coin);
    });

    // Coleta de moedas
    this.physics.add.overlap(this.player, this.coins, (player, coin) => {
      coin.destroy();
    });

    // Inimigos (retângulos vermelhos) e inimigo grande fiéis ao desenho
    this.enemies = this.physics.add.group();
    this.enemyData = [
      { x: 460, y: 480, active: false, direction: -1, type: 'normal' }, // plataforma baixa esquerda
      { x: 570, y: 400, active: false, direction: -1, type: 'normal' }, // escada
      { x: 950, y: 220, active: false, direction: -1, type: 'normal' }, // plataforma longa superior
      { x: 1100, y: 220, active: false, direction: -1, type: 'normal' },
      { x: 1250, y: 220, active: false, direction: -1, type: 'normal' },
      { x: 1450, y: 340, active: false, direction: -1, type: 'normal' }, // descendo
      { x: 2150, y: 370, active: false, direction: -1, type: 'big' }, // penúltimo inimigo é grande
      { x: 2470, y: 520, active: false, direction: -1, type: 'normal' } // final
    ];
    this.enemySprites = [];
    this.enemyData.forEach((data, i) => {
      let enemy;
      if (data.type === 'big') {
        enemy = this.add.rectangle(data.x, data.y, 32, 64, 0xff2222); // inimigo grande
      } else {
        enemy = this.add.rectangle(data.x, data.y, 32, 32, 0xff4444);
      }
      this.physics.add.existing(enemy);
      enemy.body.setCollideWorldBounds(true);
      enemy.body.setBounce(1);
      enemy.body.setImmovable(true);
      enemy.body.setVelocityX(0);
      this.enemies.add(enemy);
      this.enemySprites.push(enemy);
    });

    this.physics.add.collider(this.enemies, this.platforms, (enemy, platform) => {
      // Só executa se platform.body existir (tilemap layer pode passar tile sem body)
      if (!platform.body) return;
      const idx = this.enemySprites.indexOf(enemy);
      if (idx !== -1 && this.enemyData[idx].active) {
        // Detecta colisão lateral real
        const prevDir = this.enemyData[idx].direction;
        const enemyLeft = enemy.body.left;
        const enemyRight = enemy.body.right;
        const platLeft = platform.body.left;
        const platRight = platform.body.right;
        // Tolerância de 2 pixels para evitar bugs de física
        if (Math.abs(enemyRight - platLeft) < 2 && prevDir > 0) {
          this.enemyData[idx].direction = -1;
          enemy.body.setVelocityX(-120);
          console.log('[DEBUG] Inimigo bateu na direita e virou para esquerda', idx);
        } else if (Math.abs(enemyLeft - platRight) < 2 && prevDir < 0) {
          this.enemyData[idx].direction = 1;
          enemy.body.setVelocityX(120);
          console.log('[DEBUG] Inimigo bateu na esquerda e virou para direita', idx);
        } else {
          // Colisão vertical, mantém direção
          enemy.body.setVelocityX(this.enemyData[idx].direction * 120);
        }
      }
    });
    // Colisão entre player e inimigos: verifica se matou pulando na cabeça
    this.physics.add.collider(this.player, this.enemies, (player, enemy) => {
      // Pega o corpo físico dos dois
      const playerBody = player.body;
      const enemyBody = enemy.body;
      
      // verifica se a perte de baixo do jogador encostou no topo do inimigo
      if (
        playerBody.touching.down && 
        playerBody.bottom < enemyBody.top + 10 && // tolerância de 10 pixels
        playerBody.right > enemyBody.left && 
        playerBody.left < enemyBody.right
      ) {
        // Mata o inimigo
        const idx = this.enemySprites.indexOf(enemy);
        if (idx !== -1) {
          this.enemyData[idx].active = false; // desativa o inimigo
          enemy.destroy(); // remove o sprite do inimigo
          this.enemySprites.splice(idx, 1); // remove do array para evitar travamentos
          this.player.body.setVelocityY(-300); // impulso para o jogador
        }
      } else {
        // Caso contrário, o player perde
        this.scene.restart();
      }
    });

    // Configura limites do mundo e câmera dinâmica
    this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight);
    this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    // Flag para saber se o jogador pode terminar
    this.allCoinsCollected = false;
  }

  update() {

    const body = this.player.body;
    body.setVelocityX(0);

    // Parallax agora é automático via setScrollFactor

    // Ajusta a hitbox conforme o estado (no ar ou no chão)
    if (!body.blocked.down) {
      // No ar: hitbox como estava antes
      this.player.setSize(18, 14);
      this.player.setOffset(7, 18);
    } else {
      // No chão: hitbox menor
      this.player.setSize(18, 16);
      this.player.setOffset(7, 16);
    }

    // ...removido debug da hitbox...

    // Bloqueia controles durante o surgimento
    if (this.spawning) {
      return;
    }

    // Movimento do jogador
    let moving = false;
    if (this.cursors.left.isDown || this.keys.left.isDown) {
      body.setVelocityX(-160);
      this.player.setFlipX(true); // vira para a esquerda
      moving = true;
    } else if (this.cursors.right.isDown || this.keys.right.isDown) {
      body.setVelocityX(160);
      this.player.setFlipX(false); // vira para a direita
      moving = true;
    }
    if ((this.cursors.up.isDown || this.keys.up.isDown) && body.blocked.down) {
      body.setVelocityY(-480); // salto mais alto
    }

    // Troca de animação conforme o estado
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

    // Matar o jogador se cair no abismo (abaixo do mapa)
    if (!this.playerIsDead && this.player.y > 600) {
      this.playerIsDead = true;
      this.scene.restart();
    }

    // Lógica dos inimigos: só começam a andar ao ver o jogador, depois continuam andando
    this.enemySprites.forEach((enemy, i) => {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
      if (!this.enemyData[i].active && dist < 300) {
        // Inimigo "vê" o jogador e começa a andar para a esquerda
        this.enemyData[i].active = true;
        this.enemyData[i].direction = -1;
        enemy.body.setVelocityX(this.enemyData[i].direction * 120); // ligeiramente mais lento que o player
      }
      // Se ativo, mantém andando na direção atual
      if (this.enemyData[i].active) {
        enemy.body.setVelocityX(this.enemyData[i].direction * 120);
      }
    });

    // Verifica se todas as moedas foram coletadas
    if (!this.allCoinsCollected && this.coins.countActive(true) === 0) {
      this.allCoinsCollected = true;
    }

    // Verifica se o jogador chegou ao final do mapa e pegou todas as moedas
    if (this.allCoinsCollected && this.player.x > this.mapWidth - 100) {
      // Finaliza a fase (pode trocar de cena, mostrar mensagem, etc)
      this.scene.pause();
      this.add.text(this.player.x - 100, 200, 'Fase Completa!', { fontSize: '32px', color: '#fff' });
    }
  }
}
