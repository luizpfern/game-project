export default class CoinManager {
  constructor(scene, coinPositions) {
    this.scene = scene;
    this.coins = scene.physics.add.staticGroup();
    this.coinPositions = coinPositions || [];
    this.createCoins();
  }

  createCoins() {
    this.coinPositions.forEach(pos => {
      const coin = this.scene.add.circle(pos.x, pos.y, 10, 0xffd700);
      this.coins.add(coin);
    });
  }

  setupPlayerOverlap(player, onCollect) {
    this.scene.physics.add.overlap(player, this.coins, (player, coin) => {
      coin.destroy();
      if (onCollect) onCollect();
    });
  }

  countActive() {
    return this.coins.countActive(true);
  }
}
