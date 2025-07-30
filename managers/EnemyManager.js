export default class EnemyManager {
  constructor(scene, platforms, enemyData) {
    this.scene = scene;
    this.platforms = platforms;
    this.enemies = scene.physics.add.group();
    // Recebe a lista de inimigos do mapa
    this.enemyData = enemyData || [];
    this.enemySprites = [];
    this.createAnimations();
    this.createEnemies();
    this.setupColliders();
  }

  static preload(scene) {
    scene.load.spritesheet('mushroom_idle', 'assets/world/enemies sprites/mushroom/mushroom_crushed_anim_strip_6.png', {
      frameWidth: 16,
      frameHeight: 16
    });
    scene.load.spritesheet('mushroom_walk', 'assets/world/enemies sprites/mushroom/mushroom_walk_anim_strip_8.png', {
      frameWidth: 16,
      frameHeight: 16
    });
    scene.load.spritesheet('mushroom_death', 'assets/world/enemies sprites/mushroom/mushroom_death_anim_strip_6.png', {
      frameWidth: 16,
      frameHeight: 16
    });
  }

  createAnimations() {
    // Cria animação idle do cogumelo se ainda não existir
    if (!this.scene.anims.exists('mushroom_idle')) {
      this.scene.anims.create({
        key: 'mushroom_idle',
        frames: this.scene.anims.generateFrameNumbers('mushroom_idle', { start: 0, end: 5 }),
        frameRate: 4,
        repeat: -1
      });
    }
    // Cria animação andando
    if (!this.scene.anims.exists('mushroom_walk')) {
      this.scene.anims.create({
        key: 'mushroom_walk',
        frames: this.scene.anims.generateFrameNumbers('mushroom_walk', { start: 0, end: 5 }),
        frameRate: 8,
        repeat: -1
      });
    }
    // Cria animação de morte
    if (!this.scene.anims.exists('mushroom_death')) {
      this.scene.anims.create({
        key: 'mushroom_death',
        frames: this.scene.anims.generateFrameNumbers('mushroom_death', { start: 0, end: 5 }),
        frameRate: 10,
        repeat: 0
      });
    }
  }

  createEnemies() {
    this.enemyData.forEach((data, i) => {
      let enemy;
      enemy = this.scene.physics.add.sprite(data.x, data.y, 'mushroom_idle', 0);
      enemy.setScale(3);
      enemy.anims.play('mushroom_idle', true);
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
          enemy.anims.play('mushroom_death', true);
          this.scene.time.delayedCall(400, () => {
            enemy.destroy();
          });
          this.enemySprites.splice(idx, 1);
          player.body.setVelocityY(-400);
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
          if (enemy.setFlipX) enemy.setFlipX(true);
        } else if (enemy.body.blocked.left) {
          this.enemyData[i].direction = 1;
          enemy.body.setVelocityX(120);
          if (enemy.setFlipX) enemy.setFlipX(false);
        }
        // Troca animação para walk se estiver se movendo
        if (Math.abs(enemy.body.velocity.x) > 0) {
          enemy.anims.play('mushroom_walk', true);
          // Inverte o sprite se estiver indo para a esquerda
          enemy.setFlipX(enemy.body.velocity.x < 0);
        } else {
          enemy.anims.play('mushroom_idle', true);
        }
      } else {
        // Se não está ativo, sempre idle
        enemy.anims.play('mushroom_idle', true);
      }
    });
  }
}
