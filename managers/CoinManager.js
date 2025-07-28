export default class CoinManager {
  constructor(scene, coinPositions) {
    this.scene = scene;
    this.coins = scene.physics.add.group(); // grupo dinâmico para animação
    this.coinPositions = coinPositions || [];
    this.createCoins();
  }

  static preload(scene) {
    scene.load.spritesheet('coin_idle', 'assets/world/miscellaneous sprites/coin_anim_strip_6.png', {
      frameWidth: 8,
      frameHeight: 8
    });
    scene.load.spritesheet('coin_pickup', 'assets/world/miscellaneous sprites/coin_pickup_anim_strip_6.png', {
      frameWidth: 8,
      frameHeight: 8
    });
  }

  static createAnimations(scene) {
    if (!scene.anims.exists('coin_idle')) {
      scene.anims.create({
        key: 'coin_idle',
        frames: scene.anims.generateFrameNumbers('coin_idle', { start: 0, end: 5 }),
        frameRate: 8,
        repeat: -1
      });
    }
    if (!scene.anims.exists('coin_pickup')) {
      scene.anims.create({
        key: 'coin_pickup',
        frames: scene.anims.generateFrameNumbers('coin_pickup', { start: 0, end: 5 }),
        frameRate: 16,
        repeat: 0
      });
    }
  }

  createCoins() {
    this.coinSprites = [];
    this.coinPositions.forEach(pos => {
      // Cria sprite animado
      const coin = this.scene.physics.add.sprite(pos.x, pos.y, 'coin_idle', 0);
      coin.setScale(3);
      coin.anims.play('coin_idle', true);
      coin.body.setImmovable(true);
      coin.body.allowGravity = false;
      coin.body.moves = false;
      this.coinSprites.push(coin);
    });
  }

  setupPlayerOverlap(player, onCollect) {
    this.scene.physics.add.overlap(player, this.coinSprites, (player, coin) => {
      coin.anims.play('coin_pickup', true);
      coin.once('animationcomplete', () => {
        coin.destroy();
        if (onCollect) onCollect();
      });
    });
  }

  countActive() {
    return this.coins.countActive(true);
  }
}
