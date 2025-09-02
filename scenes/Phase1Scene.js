import Player from '../managers/Player.js';
import EnemyManager from '../managers/EnemyManager.js';
import CoinManager from '../managers/CoinManager.js';

export default class Phase1Scene extends Phaser.Scene {
  constructor() {
    super('Phase1Scene');
  }

  preload() {
    // Imagens dos props usados na Object Layer 1
    this.load.image('grass', 'assets/world/miscellaneous sprites/grass_props.png');
    this.load.image('bigflower', 'assets/world/miscellaneous sprites/bigflowers_props.png');
    this.load.image('smallflower', 'assets/world/miscellaneous sprites/flowers_props.png');
    this.load.image('rightarrow', 'assets/world/miscellaneous sprites/arrow_plate_right.png');
    this.load.image('spike', 'assets/world/miscellaneous sprites/spikes_trap.png');

    // carrega o novo mapa e tileset
    this.load.tilemapTiledJSON('mapa', 'assets/world/untitled2.json');
    this.load.image('tiles', 'assets/world/tiles and background_foreground (new)/tileset_32x32(new).png');

    // Carrega as imagens de fundo para parallax
    this.load.image('bg_0', 'assets/world/bg_0.png');
    this.load.image('bg_1', 'assets/world/bg_1.png');

    
    // Carrega o sprite do personagem principal como spritesheet (ajuste frameWidth/frameHeight conforme seu sprite)
    CoinManager.preload(this);
    Player.preload(this);
    EnemyManager.preload(this);
  }

  create() {
    this.circuloTransicaoSonicAbrir();
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
    const tileset2 = map.addTilesetImage('ground', 'tiles');
    // Ajuste o nome da camada conforme está no seu untitled.json (ex: 'Tile Layer 1', 'ground', etc)
    const layer2 = map.createLayer('Tile Layer 2', tileset2, 0, 0);
    const layer = map.createLayer('Tile Layer 1', tileset, 0, 0);
    // Ativa colisão para tiles marcados como colidíveis no Tiled
    const result = layer.setCollisionByProperty({ collides: true });
    const result2 = layer2.setCollisionByProperty({ collides: true });

    // --- OBJETOS DE DECORAÇÃO (Object Layer 1) ---
    const propObjects = map.getObjectLayer('Object Layer 1');
    if (propObjects && propObjects.objects && propObjects.objects.length > 0) {
      propObjects.objects.forEach(obj => {
        let propKey = null;
        // Descobre o tipo do prop pelo gid (Tiled)
        switch (obj.gid) {
          case 73: propKey = 'grass'; break;
          case 74: propKey = 'bigflower'; break;
          case 75: propKey = 'smallflower'; break;
          case 76: propKey = 'rightarrow'; break;
          case 77: propKey = 'spike'; break;
        }
        if (propKey) {
          this.add.image(obj.x, obj.y, propKey).setOrigin(0, 1).setScale(2);
        }
      });
    }
    // --- OBJETOS DE DECORAÇÃO (Object Layer 1) ---
    const propObjects2 = map.getObjectLayer('Object Layer 2');
    this.spikesRects = [];
    if (propObjects2 && propObjects2.objects && propObjects2.objects.length > 0) {
      propObjects2.objects.forEach(obj => {
        let propKey = null;
        // Descobre o tipo do prop pelo gid (Tiled)
        switch (obj.gid) {
          case 77: propKey = 'spike'; break;
        }
        if (propKey) {
          // Adiciona imagem decorativa
          const spikeImg = this.add.image(obj.x - 60, obj.y + obj.height - 15, propKey).setOrigin(0, 1).setScale(3.5).setFlipY(true);
          // Calcula largura e altura reais do spike
          const spikeWidth = spikeImg.displayWidth;
          const spikeHeight = spikeImg.displayHeight;
          // Cria sprite invisível para detecção de colisão
          const spikeSensor = this.physics.add.sprite(obj.x - 33, obj.y + obj.height - 44, null);
          spikeSensor.setOrigin(0, 0);
          spikeSensor.body.setAllowGravity(false);
          spikeSensor.body.setImmovable(true);
          spikeSensor.body.setSize(spikeWidth * 1.3, spikeHeight * 1.3);
          spikeSensor.setVisible(false); // invisível
          this.spikesRects.push(spikeSensor);
        }
      });
    }


    // Ajusta limites do mundo para o tamanho do mapa
    this.mapWidth = map.widthInPixels;
    this.mapHeight = map.heightInPixels;

    // --- COLISÃO DO PLAYER COM O MAPA ---
    // Plataformas agora são o layer do tilemap
    this.platforms = layer;



    // Cria o jogador usando a nova classe Player
    this.playerObj = new Player(this, 100, 435);
    this.player = this.playerObj.player;
    this.physics.add.collider(this.player, this.platforms);

    CoinManager.createAnimations(this);
    // Moedas (usando CoinManager)
    const coinPositions = [
      { x: 460, y: 500 },
      { x: 570, y: 420 },
      { x: 670, y: 340 },
      { x: 900, y: 320 },
      { x: 1050, y: 300 },
      { x: 1200, y: 280 },
      { x: 950, y: 240 },
      { x: 1100, y: 240 },
      { x: 1250, y: 240 },
      { x: 1450, y: 360 },
      { x: 1700, y: 540 },
      { x: 2150, y: 400 },
      { x: 2470, y: 540 }
    ];
    this.coinManager = new CoinManager(this, coinPositions);
    this.coinManager.setupPlayerOverlap(this.player);

    // Adiciona colisão física entre o jogador e os spikes
    this.spikesRects.forEach((sensor) => {
      if (sensor && sensor.body) {
        this.physics.add.overlap(this.player, sensor, () => {
          if (!this.playerIsDead) {
            this.playerIsDead = true;
            this.scene.restart();
          }
        });
      }
    });


    // Lista de inimigos específica para este mapa
    const enemyData = [
      { x: 460, y: 480, active: false, direction: -1, type: 'normal' },
      { x: 570, y: 400, active: false, direction: -1, type: 'normal' },
      { x: 950, y: 220, active: false, direction: -1, type: 'normal' },
      { x: 1100, y: 220, active: false, direction: -1, type: 'normal' },
      { x: 1250, y: 220, active: false, direction: -1, type: 'normal' },
      { x: 1450, y: 340, active: false, direction: -1, type: 'normal' },
      { x: 2150, y: 370, active: false, direction: -1, type: 'big' },
      { x: 2470, y: 520, active: false, direction: -1, type: 'normal' }
    ];
    this.enemyManager = new EnemyManager(this, this.platforms, enemyData);
    this.enemyManager.setupPlayerCollider(this.player, () => {
      this.scene.restart();
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


    // Atualiza o jogador
    this.playerObj.update();

    // Matar o jogador se cair no abismo (abaixo do mapa)
    if (!this.playerIsDead && this.player.y > 600) {
      this.playerIsDead = true;
      this.scene.restart();
    }

    // Atualiza inimigos
    this.enemyManager.update(this.player);

    // Verifica se todas as moedas foram coletadas
    if (!this.allCoinsCollected && this.coinManager.countActive() === 0) {
      this.allCoinsCollected = true;
    }
  }

  circuloTransicaoSonicAbrir() {
    const graphics = this.add.graphics();
    let radius = 900;
    const minRadius = 0;
    const centerX = 400;
    const centerY = 300;
    graphics.setDepth(1000);
    const abrir = () => {
      graphics.clear();
      graphics.fillStyle(0x000000, 1);
      graphics.beginPath();
      graphics.arc(centerX, centerY, radius, 0, Math.PI * 2);
      graphics.closePath();
      graphics.fillPath();
      radius -= 40;
      if (radius > minRadius) {
        this.time.delayedCall(20, abrir);
      } else {
        graphics.destroy();
      }
    };
    abrir();
  }
}
