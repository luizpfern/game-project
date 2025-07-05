export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  preload() {
    // Imagem de fundo opcional
    this.load.image('menu-bg', 'assets/sprites/bg-menu.png');
  }

  create() {
    // Fundo simples ou imagem (caso tenha)
    if (this.textures.exists('menu-bg')) {
      this.add.image(400, 300, 'menu-bg').setScrollFactor(0);
    } else {
      this.cameras.main.setBackgroundColor('#2b2d42');
    }

    // Título do jogo
    this.add.text(400, 150, 'Aventuras do Nico', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#fcbf49'
    }).setOrigin(0.5);

    // Botão "JOGAR"
    const playButton = this.add.text(400, 300, '▶ JOGAR', {
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
