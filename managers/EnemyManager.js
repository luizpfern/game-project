
export default class EnemyManager1 {
  constructor(scene, platforms, enemyData) {
    this.scene = scene;
    this.platforms = platforms;
    this.enemies = scene.physics.add.group();
    // Recebe a lista de inimigos do mapa
    this.enemyData = enemyData || [];
    this.enemySprites = [];
    this.createEnemies();
    this.setupColliders();
  }

  createEnemies() {
    this.enemyData.forEach((data, i) => {
      let enemy;
      if (data.type === 'big') {
        enemy = this.scene.add.rectangle(data.x, data.y, 32, 64, 0xff2222);
      } else {
        enemy = this.scene.add.rectangle(data.x, data.y, 32, 32, 0xff4444);
      }
      this.scene.physics.add.existing(enemy);
      enemy.body.setCollideWorldBounds(true);
      enemy.body.setBounce(1);
      enemy.body.setImmovable(true);
      enemy.body.setVelocityX(0);
      this.enemies.add(enemy);
      this.enemySprites.push(enemy);
    });
  }

  setupColliders() {
    this.scene.physics.add.collider(this.enemies, this.platforms, (enemy, platform) => {
      if (!platform.body) return;
      const idx = this.enemySprites.indexOf(enemy);
      if (idx !== -1) {
        // Força ativação do inimigo ao colidir, se não estiver ativo
        if (!this.enemyData[idx].active) {
          this.enemyData[idx].active = true;
        }
        if (enemy.body.blocked.right) {
          this.enemyData[idx].direction = -1;
          enemy.body.setVelocityX(-120);
        } else if (enemy.body.blocked.left) {
          this.enemyData[idx].direction = 1;
          enemy.body.setVelocityX(120);
        }
      }
    });
  }

  setupPlayerCollider(player, onPlayerHit) {
    this.scene.physics.add.collider(player, this.enemies, (player, enemy) => {
      const playerBody = player.body;
      const enemyBody = enemy.body;
      if (
        playerBody.touching.down &&
        playerBody.bottom < enemyBody.top + 10 &&
        playerBody.right > enemyBody.left &&
        playerBody.left < enemyBody.right
      ) {
        const idx = this.enemySprites.indexOf(enemy);
        if (idx !== -1) {
          this.enemyData[idx].active = false;
          enemy.destroy();
          this.enemySprites.splice(idx, 1);
          player.body.setVelocityY(-300);
        }
      } else {
        if (onPlayerHit) onPlayerHit();
      }
    });
  }

  update(player) {
    this.enemySprites.forEach((enemy, i) => {
      const dist = Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y);
      if (!this.enemyData[i].active && dist < 300) {
        this.enemyData[i].active = true;
        this.enemyData[i].direction = -1;
        enemy.body.setVelocityX(this.enemyData[i].direction * 120);
      }
      if (this.enemyData[i].active) {
        // Força inversão de direção se bloqueado lateralmente
        if (enemy.body.blocked.right) {
          this.enemyData[i].direction = -1;
          enemy.body.setVelocityX(-120);
        } else if (enemy.body.blocked.left) {
          this.enemyData[i].direction = 1;
          enemy.body.setVelocityX(120);
        }
      }
    });
  }
}
