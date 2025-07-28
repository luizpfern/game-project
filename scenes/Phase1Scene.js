
import Player from '../managers/Player.js';
import EnemyManager from '../managers/EnemyManager.js';
import CoinManager from '../managers/CoinManager.js';

export default class Phase1Scene extends Phaser.Scene {
  constructor() {
    super('Phase1Scene');
  }

  preload() {
    // carrega o novo mapa e tileset
    this.load.tilemapTiledJSON('mapa', 'assets/world/untitled.json');
    this.load.image('tiles', 'assets/world/tiles and background_foreground (new)/tileset_32x32(new).png');

    // Carrega as imagens de fundo para parallax
    this.load.image('bg_0', 'assets/world/bg_0.png');
    this.load.image('bg_1', 'assets/world/bg_1.png');

    
    // Carrega o sprite do personagem principal como spritesheet (ajuste frameWidth/frameHeight conforme seu sprite)
    Player.preload(this);
    EnemyManager.preload(this);
  }

  create() {
  // Efeito Sonic Mania: círculo preto sólido diminui do centro ao iniciar
  this.circuloTransicaoSonicAbrir();
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



    // Cria o jogador usando a nova classe Player
    this.playerObj = new Player(this, 100, 435);
    this.player = this.playerObj.player;
    this.physics.add.collider(this.player, this.platforms);

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
