import MenuScene from './scenes/MenuScene.js';
import Phase1Scene from './scenes/Phase1Scene.js';


const largura = 800 // window.innerWidth;
const altura = 600 //window.innerHeight;

const config = {
  type: Phaser.AUTO,
  width: largura,
  height: altura,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1000 },
      debug: false
    }
  },
  input: {
    gamepad: true
  },
  scene: [MenuScene, Phase1Scene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  pixelArt: true // Deixa o visual nítido, sem borrado ao escalar
};

const game = new Phaser.Game(config);
