export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }


  preload() {
    // Carrega imagens do menu
    this.load.image('menu-bg', 'assets/menu/menu-bg.png');
    this.load.image('menu-title', 'assets/menu/menu-title.png');
    this.load.image('menu-nico', 'assets/menu/menu-nico.png');
  }

  create() {

    // Fundo do menu ajustado para cobrir a tela sem zoom excessivo
    const bgImg = this.textures.get('menu-bg').getSourceImage();
    const bgScaleX = 800 / bgImg.width;
    const bgScaleY = 600 / bgImg.height;
    const bgScale = Math.max(bgScaleX, bgScaleY); // cobre toda a tela
    this.add.image(400, 300, 'menu-bg').setScrollFactor(0).setScale(bgScale);

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

    // Botão "JOGAR"
    const playButton = this.add.text(400, 320, '▶ JOGAR', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#ef233c',
      padding: { x: 30, y: 10 }
    }).setOrigin(0.5);

    playButton.setInteractive({ useHandCursor: true });
    playButton.on('pointerdown', () => {
      this.scene.start('Phase1Scene');
    });
  }
}
