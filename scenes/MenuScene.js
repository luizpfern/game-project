export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }


  preload() {
    // Carrega imagens do menu
    this.load.image('menu-bg', 'assets/menu/menu-bg.png');
    this.load.image('menu-title', 'assets/menu/menu-title.png');
    this.load.image('menu-nico', 'assets/menu/menu-nico.png');
    this.load.image('menu-btn', 'assets/menu/menu-btn.png');
    // Carrega música e ícones de mute
    this.load.audio('menu-music', 'assets/sounds/music.mp3');
    this.load.image('mute', 'assets/menu/menu-mute-icon.png');
    this.load.image('unmute', 'assets/menu/menu-sound-icon.png');
  }

  create() {

    // Fundo do menu ajustado para cobrir a tela sem zoom excessivo
    const bgImg = this.textures.get('menu-bg').getSourceImage();
    const bgScaleX = 800 / bgImg.width;
    const bgScaleY = 600 / bgImg.height;
    const bgScale = Math.max(bgScaleX, bgScaleY); // cobre toda a tela
    this.add.image(400, 300, 'menu-bg').setScrollFactor(0).setScale(bgScale);

    // Música de fundo
    this.menuMusic = this.sound.add('menu-music', { loop: true, volume: 0.1 });
    this.menuMusic.play();

    // Botão mute/desmute
    let isMuted = false;
    const muteBtn = this.add.image(760, 40, 'unmute').setOrigin(0.5).setScale(0.08).setInteractive({ useHandCursor: true });
    muteBtn.on('pointerdown', () => {
      isMuted = !isMuted;
      this.menuMusic.setMute(isMuted);
      muteBtn.setTexture(isMuted ? 'mute' : 'unmute');
    });

    // Título como imagem, ajustando escala para ficar maior em destaque
    const titleTargetWidth = 400;
    const titleTargetHeight = 180;
    const titleImg = this.textures.get('menu-title').getSourceImage();
    const titleScale = Math.min(titleTargetWidth / titleImg.width, titleTargetHeight / titleImg.height);
    const title = this.add.image(400, 140, 'menu-title').setOrigin(0.5, 0.5).setScale(0.4);

    // Gato ao lado do título (direita), ajustando escala e posição + animação de flutuação
    const gatoTargetHeight = titleImg.height * titleScale * 1;
    const gatoImg = this.textures.get('menu-nico').getSourceImage();
    const gatoScale = gatoTargetHeight / gatoImg.height;
    const gatoX = title.x - (title.displayWidth / 2) - (gatoImg.width * gatoScale / 2) + 70;
    const gato = this.add.image(gatoX, title.y + 10, 'menu-nico').setOrigin(0.5, 0.5).setScale(gatoScale);
    this.tweens.add({
      targets: gato,
      y: '+=18',
      yoyo: true,
      repeat: -1,
      duration: 1600,
      ease: 'Sine.easeInOut',
    });

    // Botão "JOGAR" como imagem
    const playBtnImg = this.add.image(400, 370, 'menu-btn').setOrigin(0.5).setScale(0.2).setInteractive({ useHandCursor: true });
    playBtnImg.on('pointerdown', () => {
      this.circuloTransicaoSonic(() => {
        this.scene.start('Phase1Scene');
      });
    });
  }

  // Efeito Sonic Mania: círculo preto sólido cresce do centro
  circuloTransicaoSonic(callback) {
    const graphics = this.add.graphics();
    let radius = 0;
    const maxRadius = 900;
    const centerX = 400;
    const centerY = 300;
    graphics.setDepth(1000);
    const fechar = () => {
      graphics.clear();
      graphics.fillStyle(0x000000, 1);
      graphics.beginPath();
      graphics.arc(centerX, centerY, radius, 0, Math.PI * 2);
      graphics.closePath();
      graphics.fillPath();
      radius += 40;
      if (radius < maxRadius) {
        this.time.delayedCall(20, fechar);
      } else {
        graphics.clear();
        graphics.fillStyle(0x000000, 1);
        graphics.fillRect(0, 0, 800, 600);
        callback();
      }
    };
    fechar();
  }
}
