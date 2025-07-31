// Particle Effects System
class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  // Create explosion particles
  createExplosion(x, y, color = '#ff6b35', count = 15) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 1.0,
        decay: 0.02 + Math.random() * 0.02,
        size: 3 + Math.random() * 4,
        color: color,
        type: 'explosion'
      });
    }
  }

  // Create blood particles
  createBlood(x, y, count = 8) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 1.0,
        decay: 0.015,
        size: 2 + Math.random() * 3,
        color: '#8b0000',
        type: 'blood'
      });
    }
  }

  // Create muzzle flash
  createMuzzleFlash(x, y, angle = 0) {
    for (let i = 0; i < 8; i++) {
      const spreadAngle = angle + (Math.random() - 0.5) * 0.5;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(spreadAngle) * (5 + Math.random() * 5),
        vy: Math.sin(spreadAngle) * (5 + Math.random() * 5),
        life: 1.0,
        decay: 0.08,
        size: 2 + Math.random() * 3,
        color: '#ffff00',
        type: 'muzzle'
      });
    }
  }

  // Create shell casings
  createShellCasing(x, y) {
    this.particles.push({
      x: x - 10,
      y: y,
      vx: -2 - Math.random() * 3,
      vy: -1 - Math.random() * 2,
      life: 1.0,
      decay: 0.005,
      size: 3,
      color: '#b8860b',
      type: 'shell',
      gravity: 0.1,
      bounce: 0.3
    });
  }

  // Create impact sparks
  createSparks(x, y, count = 6) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 1.0,
        decay: 0.04,
        size: 1.5 + Math.random() * 2,
        color: '#ffd700',
        type: 'spark'
      });
    }
  }

  // Update and render all particles
  update(ctx) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // Apply gravity for shell casings
      if (particle.type === 'shell' && particle.gravity) {
        particle.vy += particle.gravity;
        
        // Simple ground bounce
        if (particle.y > ctx.canvas.height - 50) {
          particle.y = ctx.canvas.height - 50;
          particle.vy *= -particle.bounce;
          particle.vx *= 0.8; // Friction
        }
      }
      
      // Decay life
      particle.life -= particle.decay;
      
      // Remove dead particles
      if (particle.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      
      // Render particle
      this.renderParticle(ctx, particle);
    }
  }

  renderParticle(ctx, particle) {
    ctx.save();
    
    // Set opacity based on life
    ctx.globalAlpha = particle.life;
    
    // Different rendering for different particle types
    switch (particle.type) {
      case 'explosion':
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * particle.life, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'blood':
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'muzzle':
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size
        );
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.5, '#ffff00');
        gradient.addColorStop(1, '#ff4500');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'shell':
        ctx.fillStyle = particle.color;
        ctx.fillRect(particle.x - 1.5, particle.y - 1, 3, 2);
        break;
        
      case 'spark':
        ctx.strokeStyle = particle.color;
        ctx.lineWidth = particle.size;
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(particle.x - particle.vx * 0.5, particle.y - particle.vy * 0.5);
        ctx.stroke();
        break;
    }
    
    ctx.restore();
  }

  // Clear all particles
  clear() {
    this.particles = [];
  }
}

// Screen shake effect
class ScreenShake {
  constructor() {
    this.intensity = 0;
    this.duration = 0;
    this.x = 0;
    this.y = 0;
  }

  shake(intensity, duration) {
    this.intensity = intensity;
    this.duration = duration;
  }

  update() {
    if (this.duration > 0) {
      this.duration--;
      this.x = (Math.random() - 0.5) * this.intensity;
      this.y = (Math.random() - 0.5) * this.intensity;
      
      // Decrease intensity over time
      this.intensity *= 0.95;
    } else {
      this.x = 0;
      this.y = 0;
      this.intensity = 0;
    }
  }

  apply(ctx) {
    if (this.intensity > 0) {
      ctx.translate(this.x, this.y);
    }
  }

  reset(ctx) {
    if (this.intensity > 0) {
      ctx.translate(-this.x, -this.y);
    }
  }
}
