// Particle System for Visual Effects
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = Utils.random(-3, 3);
        this.vy = Utils.random(-3, 3);
        this.life = 1.0;
        this.decay = Utils.random(0.01, 0.03);
        this.size = Utils.random(2, 5);
        this.color = color;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        this.vy += 0.1; // Gravity
    }
    
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    
    isDead() {
        return this.life <= 0;
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
    }
    
    emit(x, y, count, color) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }
    
    update() {
        this.particles.forEach(p => p.update());
        this.particles = this.particles.filter(p => !p.isDead());
    }
    
    draw(ctx) {
        this.particles.forEach(p => p.draw(ctx));
    }
    
    clear() {
        this.particles = [];
    }
}
