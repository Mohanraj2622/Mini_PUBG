// Enhanced Mini PUBG Game with Realistic 2D Animations
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Initialize systems
const particleSystem = new ParticleSystem();
const animationSystem = new AnimationSystem();
const screenShake = new ScreenShake();

// Game state
let gameState = {
  isPlaying: true,
  isPaused: false,
  score: 0
};

// Player object with enhanced properties
let player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  r: 25,
  health: 100,
  maxHealth: 100,
  speed: 3,
  isMoving: false,
  weaponAngle: 0,
  lastShot: 0,
  shootCooldown: 200
};

// Game arrays
let bullets = [];
let enemyBullets = [];
let enemies = [];

// Level system
let currentLevel = 0;
const levels = [
  { enemies: 2, enemySpeed: 1.2, enemyHealth: 50 },
  { enemies: 3, enemySpeed: 1.5, enemyHealth: 60 },
  { enemies: 4, enemySpeed: 1.8, enemyHealth: 70 },
  { enemies: 5, enemySpeed: 2.0, enemyHealth: 80 },
  { enemies: 6, enemySpeed: 2.2, enemyHealth: 90 }
];

// Input handling
const keys = {};
let mouseX = 0;
let mouseY = 0;

// Event listeners
document.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true;
});

document.addEventListener('keyup', (e) => {
  keys[e.key.toLowerCase()] = false;
});

document.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
  
  // Update crosshair position
  const crosshair = document.getElementById('crosshair');
  crosshair.style.left = e.clientX + 'px';
  crosshair.style.top = e.clientY + 'px';
});

document.addEventListener('click', (e) => {
  if (gameState.isPlaying) {
    shootBullet();
  }
});

document.getElementById("shootBtn").addEventListener("click", (e) => {
  e.preventDefault();
  if (gameState.isPlaying) {
    shootBullet();
  }
});

// Window resize handler
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// Create level with enhanced enemy properties
function createLevel(levelData) {
  enemies = [];
  for (let i = 0; i < levelData.enemies; i++) {
    let enemyX, enemyY;
    
    // Ensure enemies don't spawn too close to player
    do {
      enemyX = Math.random() * (canvas.width - 100) + 50;
      enemyY = Math.random() * (canvas.height - 100) + 50;
    } while (Math.hypot(enemyX - player.x, enemyY - player.y) < 150);
    
    enemies.push({
      x: enemyX,
      y: enemyY,
      r: 25,
      health: levelData.enemyHealth,
      maxHealth: levelData.enemyHealth,
      cooldown: Math.random() * 60,
      speed: levelData.enemySpeed,
      isMoving: false,
      targetX: player.x,
      targetY: player.y,
      lastDamageTime: 0,
      aiState: 'hunt', // hunt, attack, retreat
      retreatTime: 0
    });
  }
  
  bullets = [];
  enemyBullets = [];
  particleSystem.clear();
  
  // Update UI
  updateLevelDisplay();
  updateEnemyCount();
}

// Enhanced shooting with animations
function shootBullet() {
  const now = Date.now();
  if (now - player.lastShot < player.shootCooldown) return;
  
  player.lastShot = now;
  
  // Calculate angle to mouse
  const angle = Math.atan2(mouseY - player.y, mouseX - player.x);
  player.weaponAngle = angle;
  
  // Create bullet
  const bulletSpeed = 12;
  bullets.push({
    x: player.x + Math.cos(angle) * 30,
    y: player.y + Math.sin(angle) * 30,
    dx: Math.cos(angle) * bulletSpeed,
    dy: Math.sin(angle) * bulletSpeed,
    damage: 25,
    life: 100
  });
  
  // Effects
  particleSystem.createMuzzleFlash(
    player.x + Math.cos(angle) * 30,
    player.y + Math.sin(angle) * 30,
    angle
  );
  particleSystem.createShellCasing(player.x, player.y);
  screenShake.shake(3, 8);
}

// Enhanced enemy AI with different states
function updateEnemyAI(enemy) {
  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;
  const dist = Math.hypot(dx, dy);
  
  enemy.targetX = player.x;
  enemy.targetY = player.y;
  
  // AI State machine
  switch (enemy.aiState) {
    case 'hunt':
      if (dist > 80) {
        // Move towards player
        enemy.x += (dx / dist) * enemy.speed;
        enemy.y += (dy / dist) * enemy.speed;
        enemy.isMoving = true;
      } else {
        enemy.aiState = 'attack';
        enemy.isMoving = false;
      }
      break;
      
    case 'attack':
      if (dist > 120) {
        enemy.aiState = 'hunt';
      } else if (enemy.health < enemy.maxHealth * 0.3) {
        enemy.aiState = 'retreat';
        enemy.retreatTime = 120;
      }
      break;
      
    case 'retreat':
      // Move away from player
      enemy.x -= (dx / dist) * enemy.speed * 0.8;
      enemy.y -= (dy / dist) * enemy.speed * 0.8;
      enemy.isMoving = true;
      enemy.retreatTime--;
      
      if (enemy.retreatTime <= 0) {
        enemy.aiState = 'hunt';
      }
      break;
  }
  
  // Shooting logic
  if (enemy.cooldown <= 0 && dist < 200 && enemy.aiState !== 'retreat') {
    shootEnemyBullet(enemy);
    enemy.cooldown = 60 + Math.random() * 40;
  } else {
    enemy.cooldown--;
  }
}

// Enhanced enemy shooting
function shootEnemyBullet(enemy) {
  // Lead target prediction
  const bulletSpeed = 6;
  const timeToTarget = Math.hypot(player.x - enemy.x, player.y - enemy.y) / bulletSpeed;
  const predictedX = player.x + (keys['a'] ? -player.speed : keys['d'] ? player.speed : 0) * timeToTarget;
  const predictedY = player.y + (keys['w'] ? -player.speed : keys['s'] ? player.speed : 0) * timeToTarget;
  
  const angle = Math.atan2(predictedY - enemy.y, predictedX - enemy.x);
  
  enemyBullets.push({
    x: enemy.x + Math.cos(angle) * 30,
    y: enemy.y + Math.sin(angle) * 30,
    dx: Math.cos(angle) * bulletSpeed,
    dy: Math.sin(angle) * bulletSpeed,
    damage: 15,
    life: 100
  });
  
  // Effects
  particleSystem.createMuzzleFlash(
    enemy.x + Math.cos(angle) * 30,
    enemy.y + Math.sin(angle) * 30,
    angle
  );
}

// Enhanced bullet physics and collision
function updateBullets(bulletArray, isPlayerBullet = false) {
  for (let i = bulletArray.length - 1; i >= 0; i--) {
    const bullet = bulletArray[i];
    
    // Update position
    bullet.x += bullet.dx;
    bullet.y += bullet.dy;
    bullet.life--;
    
    // Remove bullets that are off-screen or expired
    if (bullet.x < 0 || bullet.x > canvas.width || 
        bullet.y < 0 || bullet.y > canvas.height || 
        bullet.life <= 0) {
      bulletArray.splice(i, 1);
      continue;
    }
    
    // Collision detection
    if (isPlayerBullet) {
      // Check enemy hits
      for (let j = enemies.length - 1; j >= 0; j--) {
        const enemy = enemies[j];
        const dist = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y);
        
        if (dist < enemy.r + 5) {
          // Hit enemy
          enemy.health -= bullet.damage;
          enemy.lastDamageTime = Date.now();
          
          // Effects
          particleSystem.createBlood(bullet.x, bullet.y);
          particleSystem.createSparks(bullet.x, bullet.y);
          animationSystem.createDamageNumber(bullet.x, bullet.y - 20, bullet.damage);
          screenShake.shake(2, 5);
          
          // Remove bullet
          bulletArray.splice(i, 1);
          
          // Remove enemy if dead
          if (enemy.health <= 0) {
            particleSystem.createExplosion(enemy.x, enemy.y, '#ff4444', 20);
            enemies.splice(j, 1);
            gameState.score += 100;
            screenShake.shake(5, 10);
          }
          break;
        }
      }
    } else {
      // Check player hit
      const dist = Math.hypot(bullet.x - player.x, bullet.y - player.y);
      if (dist < player.r + 5) {
        // Hit player
        player.health -= bullet.damage;
        
        // Effects
        particleSystem.createBlood(bullet.x, bullet.y);
        animationSystem.createDamageNumber(bullet.x, bullet.y - 20, bullet.damage);
        screenShake.shake(4, 8);
        
        // Remove bullet
        bulletArray.splice(i, 1);
        
        // Update health display
        updateHealth();
        break;
      }
    }
  }
}

// Enhanced player movement
function updatePlayer() {
  player.isMoving = false;
  
  // WASD movement
  if (keys['w'] || keys['arrowup']) {
    player.y -= player.speed;
    player.isMoving = true;
  }
  if (keys['s'] || keys['arrowdown']) {
    player.y += player.speed;
    player.isMoving = true;
  }
  if (keys['a'] || keys['arrowleft']) {
    player.x -= player.speed;
    player.isMoving = true;
  }
  if (keys['d'] || keys['arrowright']) {
    player.x += player.speed;
    player.isMoving = true;
  }
  
  // Keep player in bounds
  player.x = Math.max(player.r, Math.min(canvas.width - player.r, player.x));
  player.y = Math.max(player.r, Math.min(canvas.height - player.r, player.y));
  
  // Update weapon angle to mouse
  player.weaponAngle = Math.atan2(mouseY - player.y, mouseX - player.x);
}

// UI update functions
function updateHealth() {
  const healthBar = document.getElementById("healthBar");
  const healthValue = document.querySelector(".bar-value");
  const healthPercent = (player.health / player.maxHealth) * 100;
  
  healthBar.style.width = `${Math.max(0, healthPercent)}%`;
  healthValue.textContent = Math.max(0, player.health);
  
  // Add warning class for low health
  if (player.health < 30) {
    healthBar.classList.add('low');
  } else {
    healthBar.classList.remove('low');
  }
  
  // Game over check
  if (player.health <= 0) {
    gameOver();
  }
}

function updateLevelDisplay() {
  document.getElementById("levelDisplay").textContent = `Level: ${currentLevel + 1}`;
}

function updateEnemyCount() {
  document.getElementById("enemyCount").textContent = `Enemies: ${enemies.length}`;
}

function gameOver() {
  gameState.isPlaying = false;
  
  // Create game over overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: white;
    font-family: Arial, sans-serif;
    z-index: 1000;
  `;
  
  overlay.innerHTML = `
    <h1 style="font-size: 48px; margin: 0; color: #e74c3c;">💀 GAME OVER</h1>
    <p style="font-size: 24px; margin: 20px 0;">Score: ${gameState.score}</p>
    <p style="font-size: 18px; margin: 10px 0;">Level Reached: ${currentLevel + 1}</p>
    <button onclick="location.reload()" style="
      font-size: 20px;
      padding: 15px 30px;
      margin-top: 30px;
      border: none;
      border-radius: 8px;
      background: #e74c3c;
      color: white;
      cursor: pointer;
      transition: all 0.2s ease;
    ">🔄 Play Again</button>
  `;
  
  document.body.appendChild(overlay);
}

function nextLevel() {
  currentLevel++;
  
  if (currentLevel < levels.length) {
    // Show level complete message
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 100, 0, 0.8);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      color: white;
      font-family: Arial, sans-serif;
      z-index: 1000;
    `;
    
    overlay.innerHTML = `
      <h1 style="font-size: 36px; margin: 0;">✅ Level ${currentLevel} Complete!</h1>
      <p style="font-size: 18px; margin: 20px 0;">Score: ${gameState.score}</p>
      <p style="font-size: 16px;">Next level starting...</p>
    `;
    
    document.body.appendChild(overlay);
    
    setTimeout(() => {
      overlay.remove();
      createLevel(levels[currentLevel]);
      // Heal player slightly between levels
      player.health = Math.min(player.maxHealth, player.health + 25);
      updateHealth();
    }, 2000);
  } else {
    // Victory!
    gameState.isPlaying = false;
    
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(45deg, #f39c12, #e67e22);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      color: white;
      font-family: Arial, sans-serif;
      z-index: 1000;
    `;
    
    overlay.innerHTML = `
      <h1 style="font-size: 48px; margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">🎉 VICTORY!</h1>
      <p style="font-size: 24px; margin: 20px 0;">Final Score: ${gameState.score}</p>
      <p style="font-size: 18px; margin: 10px 0;">You completed all levels!</p>
      <button onclick="location.reload()" style="
        font-size: 20px;
        padding: 15px 30px;
        margin-top: 30px;
        border: none;
        border-radius: 8px;
        background: #27ae60;
        color: white;
        cursor: pointer;
        transition: all 0.2s ease;
      ">🔄 Play Again</button>
    `;
    
    document.body.appendChild(overlay);
  }
}

// Main game loop
function gameLoop() {
  if (!gameState.isPlaying) return;
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Apply screen shake
  screenShake.update();
  screenShake.apply(ctx);
  
  // Draw background
  animationSystem.drawBackground(ctx, canvas);
  
  // Update game objects
  updatePlayer();
  
  enemies.forEach(enemy => {
    updateEnemyAI(enemy);
  });
  
  updateBullets(bullets, true);
  updateBullets(enemyBullets, false);
  
  // Update systems
  animationSystem.update();
  particleSystem.update(ctx);
  
  // Draw game objects
  animationSystem.drawPlayer(ctx, player);
  
  enemies.forEach(enemy => {
    animationSystem.drawEnemy(ctx, enemy);
  });
  
  bullets.forEach(bullet => {
    animationSystem.drawBullet(ctx, bullet, '#ffff00');
  });
  
  enemyBullets.forEach(bullet => {
    animationSystem.drawBullet(ctx, bullet, '#ff4444');
  });
  
  // Reset screen shake
  screenShake.reset(ctx);
  
  // Update UI
  updateEnemyCount();
  
  // Check win condition
  if (enemies.length === 0) {
    nextLevel();
    return;
  }
  
  requestAnimationFrame(gameLoop);
}

// Initialize game
createLevel(levels[currentLevel]);
updateHealth();
gameLoop();
