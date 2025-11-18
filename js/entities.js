// Game Entities
class Paddle {
    constructor(x, y, color, isPlayer1) {
        this.x = x;
        this.y = y;
        this.width = CONFIG.PADDLE_WIDTH;
        this.height = CONFIG.PADDLE_HEIGHT;
        this.baseHeight = CONFIG.PADDLE_HEIGHT;
        this.color = color;
        this.isPlayer1 = isPlayer1;
        this.dy = 0;
        this.score = 0;
        this.stunned = false;
        this.stunnedTime = 0;
        this.powerUp = null;
        this.powerUpTime = 0;
        this.combo = 0;
        this.lastHitTime = 0;
        this.controlScheme = null; // For single player mode
    }
    
    update(keys, currentTime) {
        // Handle stun
        if (this.stunned && currentTime - this.stunnedTime > CONFIG.FREEZE_DURATION) {
            this.stunned = false;
        }
        
        // Handle power-up expiration
        if (this.powerUp && currentTime - this.powerUpTime > CONFIG.POWERUP_DURATION) {
            this.powerUp = null;
            this.height = this.baseHeight;
        }
        
        // Reset combo if too much time passed
        if (currentTime - this.lastHitTime > 3000) {
            this.combo = 0;
        }
        
        // Calculate speed
        const speed = (this.powerUp === 'speed' ? CONFIG.PADDLE_SPEED * 1.8 : CONFIG.PADDLE_SPEED);
        
        // Reset dy first
        this.dy = 0;
        
        if (!this.stunned) {
            if (this.isPlayer1) {
                // In single player mode, use the selected control scheme
                if (this.controlScheme === CONFIG.CONTROL_SCHEMES.ARROWS) {
                    if (keys[CONFIG.KEYS.ARROW_UP]) {
                        this.dy = -speed;
                    } else if (keys[CONFIG.KEYS.ARROW_DOWN]) {
                        this.dy = speed;
                    }
                } else {
                    // Default to W/S or when controlScheme is not set (two player mode)
                    if (keys[CONFIG.KEYS.W]) {
                        this.dy = -speed;
                    } else if (keys[CONFIG.KEYS.S]) {
                        this.dy = speed;
                    }
                }
            } else {
                if (keys[CONFIG.KEYS.ARROW_UP]) {
                    this.dy = -speed;
                } else if (keys[CONFIG.KEYS.ARROW_DOWN]) {
                    this.dy = speed;
                }
            }
        }
        
        // Update position
        this.y += this.dy;
        this.y = Utils.clamp(this.y, 0, CONFIG.CANVAS_HEIGHT - this.height);
    }
    
    draw(ctx) {
        // Draw stun effect
        if (this.stunned) {
            ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
            ctx.fillRect(this.x - 5, this.y - 5, this.width + 10, this.height + 10);
        }
        
        // Draw movement indicator (brighter when moving)
        const isMoving = Math.abs(this.dy) > 0;
        if (isMoving) {
            ctx.fillStyle = this.color;
            ctx.globalAlpha = 0.5;
            ctx.fillRect(this.x - 3, this.y - 3, this.width + 6, this.height + 6);
            ctx.globalAlpha = 1.0;
        }
        
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Glow effect
        ctx.shadowBlur = isMoving ? 20 : 10;
        ctx.shadowColor = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
        
        // Power-up indicator
        if (this.powerUp) {
            const powerUpInfo = CONFIG.POWERUP_TYPES.find(p => p.type === this.powerUp);
            ctx.font = '20px Arial';
            ctx.fillText(powerUpInfo.emoji, this.x - 10, this.y - 10);
        }
        
        // Combo indicator
        if (this.combo > 1) {
            ctx.font = 'bold 16px Arial';
            ctx.fillStyle = '#ffd700';
            ctx.fillText(`x${this.combo}`, this.x - 5, this.y + this.height + 20);
        }
    }
    
    recordHit(currentTime) {
        this.lastHitTime = currentTime;
        this.combo++;
    }
    
    getHitPosition(ballY) {
        // Return normalized hit position (-1 to 1)
        const relativeY = ballY - (this.y + this.height / 2);
        return Utils.clamp(relativeY / (this.height / 2), -1, 1);
    }
}

class Ball {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = CONFIG.BALL_RADIUS;
        this.speed = CONFIG.BALL_INITIAL_SPEED;
        this.dx = CONFIG.BALL_INITIAL_SPEED;
        this.dy = 0;
        this.color = CONFIG.COLORS.BALL;
        this.invisible = false;
        this.invisibleTime = 0;
        this.curved = false;
        this.slowMo = false;
        this.trail = [];
    }
    
    update(currentTime) {
        // Update effects
        if (this.invisible && currentTime - this.invisibleTime > CONFIG.INVISIBLE_DURATION) {
            this.invisible = false;
        }
        
        // Apply curve effect
        if (this.curved) {
            this.dy += Math.sin(this.x * 0.02) * 0.3;
        }
        
        // Apply slow motion
        const speedMod = this.slowMo ? 0.5 : 1;
        
        this.x += this.dx * speedMod;
        this.y += this.dy * speedMod;
        
        // Add to trail
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 10) this.trail.shift();
        
        // Wall collision
        if (this.y - this.radius <= 0 || this.y + this.radius >= CONFIG.CANVAS_HEIGHT) {
            this.dy *= -1;
            this.y = Utils.clamp(this.y, this.radius, CONFIG.CANVAS_HEIGHT - this.radius);
        }
    }
    
    handlePaddleCollision(paddle, currentTime, particleSystem) {
        if (!Utils.circleRectCollision(this, paddle)) {
            return false;
        }
        
        // Calculate hit position on paddle (-1 to 1)
        const hitPos = paddle.getHitPosition(this.y);
        
        // Reverse horizontal direction
        this.dx *= -1;
        
        // Set vertical direction based on where ball hit the paddle
        const maxAngle = 60 * Math.PI / 180; // 60 degrees max
        this.dy = Math.sin(hitPos * maxAngle) * Math.abs(this.dx);
        
        // Increase speed
        this.dx *= CONFIG.BALL_SPEED_INCREMENT;
        this.dy *= CONFIG.BALL_SPEED_INCREMENT;
        
        // Limit max speed
        if (Math.abs(this.dx) > CONFIG.BALL_MAX_SPEED) {
            this.dx = this.dx > 0 ? CONFIG.BALL_MAX_SPEED : -CONFIG.BALL_MAX_SPEED;
        }
        if (Math.abs(this.dy) > CONFIG.BALL_MAX_SPEED) {
            this.dy = this.dy > 0 ? CONFIG.BALL_MAX_SPEED : -CONFIG.BALL_MAX_SPEED;
        }
        
        // Position ball outside paddle to prevent multiple collisions
        if (this.dx > 0) {
            this.x = paddle.x + paddle.width + this.radius;
        } else {
            this.x = paddle.x - this.radius;
        }
        
        // Record hit
        paddle.recordHit(currentTime);
        
        // Emit particles
        particleSystem.emit(this.x, this.y, 10, paddle.color);
        
        return true;
    }
    
    draw(ctx) {
        // Draw trail
        ctx.globalAlpha = 0.3;
        for (let i = 0; i < this.trail.length; i++) {
            const t = this.trail[i];
            const alpha = i / this.trail.length;
            ctx.globalAlpha = alpha * 0.3;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(t.x, t.y, this.radius * alpha, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        
        // Draw ball (invisible effect)
        if (this.invisible) {
            ctx.globalAlpha = 0.2;
        }
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.globalAlpha = 1;
    }
    
    reset() {
        this.x = CONFIG.CANVAS_WIDTH / 2;
        this.y = CONFIG.CANVAS_HEIGHT / 2;
        this.speed = CONFIG.BALL_INITIAL_SPEED;
        this.dx = (Math.random() > 0.5 ? 1 : -1) * CONFIG.BALL_INITIAL_SPEED;
        this.dy = Utils.random(-2, 2);
        this.invisible = false;
        this.curved = false;
        this.trail = [];
    }
}

class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.radius = CONFIG.POWERUP_RADIUS;
        this.type = type.type;
        this.color = type.color;
        this.emoji = type.emoji;
        this.description = type.description;
        this.rotation = 0;
        this.pulse = 0;
    }
    
    update() {
        this.rotation += 0.05;
        this.pulse += 0.1;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        const pulseSize = this.radius + Math.sin(this.pulse) * 3;
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, pulseSize, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, pulseSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.font = '20px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.emoji, 0, 0);
        
        ctx.restore();
    }
    
    checkCollision(ball) {
        return Utils.distance(this.x, this.y, ball.x, ball.y) < this.radius + ball.radius;
    }
}

class Obstacle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = CONFIG.OBSTACLE_WIDTH;
        this.height = CONFIG.OBSTACLE_HEIGHT;
        this.dy = (Math.random() > 0.5 ? 1 : -1) * CONFIG.OBSTACLE_SPEED;
    }
    
    update() {
        this.y += this.dy;
        
        if (this.y <= 0 || this.y + this.height >= CONFIG.CANVAS_HEIGHT) {
            this.dy *= -1;
        }
    }
    
    draw(ctx) {
        ctx.fillStyle = '#ff3333';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ff3333';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
    }
    
    checkCollision(ball) {
        return Utils.circleRectCollision(ball, this);
    }
}
