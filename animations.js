// Animation and sprite handling system
class AnimationSystem {
  constructor() {
    this.time = 0;
  }

  update() {
    this.time += 1;
  }

  // Draw animated player with walking animation
  drawPlayer(ctx, player) {
    ctx.save();
    
    // Player body (more detailed)
    const bodyRadius = player.r * 0.7;
    const headRadius = player.r * 0.4;
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(player.x, player.y + player.r + 5, player.r * 0.8, player.r * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Walking animation offset
    const walkOffset = player.isMoving ? Math.sin(this.time * 0.3) * 2 : 0;
    
    // Body
    const gradient = ctx.createRadialGradient(
      player.x, player.y - walkOffset, 0,
      player.x, player.y - walkOffset, bodyRadius
    );
    gradient.addColorStop(0, '#4a90e2');
    gradient.addColorStop(1, '#2c5aa0');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(player.x, player.y - walkOffset, bodyRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Body outline
    ctx.strokeStyle = '#1e3a5f';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Head
    ctx.fillStyle = '#fdbcb4';
    ctx.beginPath();
    ctx.arc(player.x, player.y - bodyRadius - headRadius - walkOffset, headRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Head outline
    ctx.strokeStyle = '#d4a574';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(player.x - 5, player.y - bodyRadius - headRadius - 3 - walkOffset, 2, 0, Math.PI * 2);
    ctx.arc(player.x + 5, player.y - bodyRadius - headRadius - 3 - walkOffset, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Weapon
    this.drawWeapon(ctx, player.x + 15, player.y - 10 - walkOffset, player.weaponAngle || 0);
    
    // Health indicator above player
    if (player.health < 50) {
      ctx.fillStyle = player.health < 25 ? '#e74c3c' : '#f39c12';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${player.health}`, player.x, player.y - player.r - 25);
    }
    
    ctx.restore();
  }

  // Draw animated enemy with AI behavior indicators
  drawEnemy(ctx, enemy) {
    ctx.save();
    
    const bodyRadius = enemy.r * 0.7;
    const headRadius = enemy.r * 0.4;
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(enemy.x, enemy.y + enemy.r + 5, enemy.r * 0.8, enemy.r * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Movement animation
    const moveOffset = enemy.isMoving ? Math.sin(this.time * 0.4 + enemy.x * 0.01) * 1.5 : 0;
    
    // Body with hostile coloring
    const gradient = ctx.createRadialGradient(
      enemy.x, enemy.y - moveOffset, 0,
      enemy.x, enemy.y - moveOffset, bodyRadius
    );
    gradient.addColorStop(0, '#e74c3c');
    gradient.addColorStop(1, '#c0392b');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y - moveOffset, bodyRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Body outline
    ctx.strokeStyle = '#8b0000';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Head
    ctx.fillStyle = '#fdbcb4';
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y - bodyRadius - headRadius - moveOffset, headRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Angry eyes
    ctx.fillStyle = '#8b0000';
    ctx.beginPath();
    ctx.arc(enemy.x - 4, enemy.y - bodyRadius - headRadius - 2 - moveOffset, 1.5, 0, Math.PI * 2);
    ctx.arc(enemy.x + 4, enemy.y - bodyRadius - headRadius - 2 - moveOffset, 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Weapon
    const weaponAngle = Math.atan2(enemy.targetY - enemy.y, enemy.targetX - enemy.x);
    this.drawWeapon(ctx, enemy.x + 15, enemy.y - 10 - moveOffset, weaponAngle, '#666');
    
    // Cooldown indicator
    if (enemy.cooldown > 30) {
      const cooldownPercent = (enemy.cooldown - 30) / 60;
      ctx.fillStyle = `rgba(255, 0, 0, ${cooldownPercent})`;
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y - enemy.r - 15, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }

  // Draw weapon with recoil animation
  drawWeapon(ctx, x, y, angle, color = '#333') {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    
    // Weapon body
    ctx.fillStyle = color;
    ctx.fillRect(-5, -3, 25, 6);
    
    // Weapon barrel
    ctx.fillStyle = '#222';
    ctx.fillRect(15, -2, 8, 4);
    
    // Weapon grip
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(-5, 3, 8, 5);
    
    ctx.restore();
  }

  // Draw bullet with trail effect
  drawBullet(ctx, bullet, color) {
    ctx.save();
    
    // Bullet trail
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.moveTo(bullet.x, bullet.y);
    ctx.lineTo(bullet.x - bullet.dx * 2, bullet.y - bullet.dy * 2);
    ctx.stroke();
    
    // Bullet core
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Bullet glow
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }

  // Draw background with parallax effect
  drawBackground(ctx, canvas) {
    // Animated grid pattern
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    const gridSize = 50;
    const offsetX = (this.time * 0.5) % gridSize;
    const offsetY = (this.time * 0.3) % gridSize;
    
    for (let x = -offsetX; x < canvas.width + gridSize; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    for (let y = -offsetY; y < canvas.height + gridSize; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    ctx.restore();
  }

  // Create damage number animation
  createDamageNumber(x, y, damage) {
    const damageEl = document.createElement('div');
    damageEl.className = 'damage-indicator';
    damageEl.textContent = `-${damage}`;
    damageEl.style.left = x + 'px';
    damageEl.style.top = y + 'px';
    
    document.body.appendChild(damageEl);
    
    // Animate the damage number
    let startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / 1000; // 1 second animation
      
      if (progress < 1) {
        damageEl.style.transform = `translateY(${-progress * 50}px)`;
        damageEl.style.opacity = 1 - progress;
        requestAnimationFrame(animate);
      } else {
        damageEl.remove();
      }
    };
    
    animate();
  }
}
