// Main Game Class
class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.keys = {};
        this.touchControls = { up: false, down: false };
        this.useDragControl = false;
        this.dragY = null;
        
        // Game mode
        this.gameMode = GAME_MODES.TWO_PLAYER;
        this.aiPlayer = null;
        this.tournament = null;
        
        // Game state
        this.running = false;
        this.gameOver = false;
        this.startTime = 0;
        this.elapsedTime = 0;
        this.pausedTime = 0;
        this.lastPauseTime = 0;
        this.difficultyLevel = 1;
        this.lastDifficultyIncrease = 0;
        
        // Entities
        this.player1 = new Paddle(
            CONFIG.PADDLE_OFFSET,
            CONFIG.CANVAS_HEIGHT / 2 - CONFIG.PADDLE_HEIGHT / 2,
            CONFIG.COLORS.PLAYER1,
            true
        );
        
        this.player2 = new Paddle(
            CONFIG.CANVAS_WIDTH - CONFIG.PADDLE_WIDTH - CONFIG.PADDLE_OFFSET,
            CONFIG.CANVAS_HEIGHT / 2 - CONFIG.PADDLE_HEIGHT / 2,
            CONFIG.COLORS.PLAYER2,
            false
        );
        
        this.ball = new Ball(CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2);
        this.extraBalls = [];
        this.powerUps = [];
        this.obstacles = [];
        this.helperPaddles = []; // Support bots
        
        // Systems
        this.particleSystem = new ParticleSystem();
        this.lastPowerUpTime = 0;
        this.obstaclesActive = false;
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Prevent default arrow key scrolling
        window.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) {
                e.preventDefault();
            }
        }, false);
        
        document.addEventListener('keydown', (e) => {
            // Use e.code instead of e.key for language independence
            this.keys[e.code] = true;
            
            if (e.code === CONFIG.KEYS.SPACE) {
                e.preventDefault();
                this.togglePause();
            }
            
            if (e.code === CONFIG.KEYS.R) {
                this.reset();
            }
            
            if (e.code === CONFIG.KEYS.QUESTION && e.shiftKey) {
                document.getElementById('helpModal').style.display = 'block';
            }
            
            if (e.code === CONFIG.KEYS.ESCAPE) {
                document.getElementById('helpModal').style.display = 'none';
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Fix for stuck keys when window loses focus
        window.addEventListener('blur', () => {
            this.keys = {};
        });
        
        // Clear all keys when window regains focus
        window.addEventListener('focus', () => {
            this.keys = {};
        });
        
        // Mobile touch controls
        this.setupTouchControls();
    }
    
    setupTouchControls() {
        const touchUp = document.getElementById('touchUp');
        const touchDown = document.getElementById('touchDown');
        const mobileStartBtn = document.getElementById('mobileStartBtn');
        
        if (touchUp && touchDown) {
            // Touch start
            touchUp.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.touchControls.up = true;
                touchUp.classList.add('pressed');
            });
            
            touchDown.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.touchControls.down = true;
                touchDown.classList.add('pressed');
            });
            
            // Touch end
            touchUp.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.touchControls.up = false;
                touchUp.classList.remove('pressed');
            });
            
            touchDown.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.touchControls.down = false;
                touchDown.classList.remove('pressed');
            });
            
            // Prevent context menu
            touchUp.addEventListener('contextmenu', (e) => e.preventDefault());
            touchDown.addEventListener('contextmenu', (e) => e.preventDefault());
        }
        
        // Mobile start/pause button
        if (mobileStartBtn) {
            mobileStartBtn.addEventListener('click', () => {
                this.togglePause();
                this.updateMobileStartButton();
            });
            
            mobileStartBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.togglePause();
                this.updateMobileStartButton();
            });
        }
    }
    
    setupDragControls() {
        // Touch drag on canvas
        this.canvas.addEventListener('touchstart', (e) => {
            // Auto-start game on first touch if not running
            if (!this.running && !this.gameOver) {
                this.togglePause();
            }
            
            if (!this.useDragControl) return;
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this.dragY = touch.clientY - rect.top;
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            if (!this.useDragControl) return;
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this.dragY = touch.clientY - rect.top;
        });
        
        this.canvas.addEventListener('touchend', () => {
            if (!this.useDragControl) return;
            this.dragY = null;
        });
        
        // Mouse drag on canvas (for desktop)
        this.canvas.addEventListener('mousedown', (e) => {
            // Auto-start game on first click if not running
            if (!this.running && !this.gameOver) {
                this.togglePause();
            }
            
            if (!this.useDragControl) return;
            const rect = this.canvas.getBoundingClientRect();
            this.dragY = e.clientY - rect.top;
            this.canvas.style.cursor = 'grabbing';
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.useDragControl || this.dragY === null) return;
            const rect = this.canvas.getBoundingClientRect();
            this.dragY = e.clientY - rect.top;
        });
        
        this.canvas.addEventListener('mouseup', () => {
            if (!this.useDragControl) return;
            this.dragY = null;
            this.canvas.style.cursor = 'grab';
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            if (!this.useDragControl) return;
            this.dragY = null;
            this.canvas.style.cursor = 'grab';
        });
        
        if (this.useDragControl) {
            this.canvas.style.cursor = 'grab';
        }
    }
    
    updateMobileStartButton() {
        const mobileStartBtn = document.getElementById('mobileStartBtn');
        if (mobileStartBtn) {
            if (this.running) {
                mobileStartBtn.textContent = 'PAUSE';
                mobileStartBtn.style.background = 'linear-gradient(135deg, #f39c12 0%, #e74c3c 100%)';
            } else {
                mobileStartBtn.textContent = this.startTime === 0 ? 'START' : 'RESUME';
                mobileStartBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            }
        }
    }
    
    setGameMode(mode, controlScheme, useDrag = false) {
        this.gameMode = mode;
        this.useDragControl = useDrag;
        
        // Toggle touch button visibility based on drag mode
        const touchButtons = document.querySelector('.mobile-controls');
        if (touchButtons) {
            if (useDrag) {
                touchButtons.style.display = 'none';
            } else {
                touchButtons.style.display = 'flex';
            }
        }
        
        if (mode === GAME_MODES.SINGLE_PLAYER) {
            // In single player, swap paddles: player on right, AI on left
            this.aiPlayer = new AIPlayer(this.player1, 'VERY_EASY'); // AI controls left paddle, starts very easy
            this.player2.controlScheme = controlScheme || CONFIG.CONTROL_SCHEMES.ARROWS; // Player controls right paddle
            this.player1.controlScheme = null; // AI doesn't need control scheme
            
            // Setup drag controls if enabled
            if (useDrag) {
                this.setupDragControls();
            }
        } else if (mode === GAME_MODES.THREE_PLAYER) {
            this.tournament = new TournamentManager();
            this.player1.controlScheme = null; // Reset to default two-player controls
            this.player2.controlScheme = null;
        } else {
            this.aiPlayer = null;
            this.tournament = null;
            this.player1.controlScheme = null; // Reset to default two-player controls
            this.player2.controlScheme = null;
        }
        
        this.reset();
    }
    
    togglePause() {
        if (this.gameOver) return;
        
        this.running = !this.running;
        
        if (!this.running) {
            this.lastPauseTime = Date.now();
        } else {
            if (this.lastPauseTime > 0) {
                this.pausedTime += Date.now() - this.lastPauseTime;
            }
            if (this.startTime === 0) {
                this.startTime = Date.now();
            }
        }
        
        this.updateStatus();
        this.updateMobileStartButton();
    }
    
    getCurrentTime() {
        if (!this.running) return this.elapsedTime;
        return Date.now() - this.startTime - this.pausedTime;
    }
    
    update() {
        if (!this.running || this.gameOver) return;
        
        const currentTime = Date.now();
        this.elapsedTime = this.getCurrentTime();
        
        // Update difficulty
        this.updateDifficulty(currentTime);
        
        // Update entities based on game mode
        if (this.gameMode === GAME_MODES.SINGLE_PLAYER && this.aiPlayer) {
            // Single player: AI controls player1 (left), human controls player2 (right)
            // Don't update player1 with keys - AI does it
            this.aiPlayer.updateDifficulty(this.player2.score, this.elapsedTime);
            this.aiPlayer.update(this.ball, currentTime, this.extraBalls);
            // Update human player (player2) with touch controls or drag
            // Pass difficulty multiplier so paddle speed scales with ball speed
            const canvasRect = this.canvas.getBoundingClientRect();
            const dragY = this.useDragControl ? this.dragY : null;
            this.player2.update(this.keys, currentTime, this.touchControls, dragY, canvasRect.height, this.difficultyLevel);
        } else {
            // Two player or tournament: both paddles controlled by keys
            this.player1.update(this.keys, currentTime, null, null, CONFIG.CANVAS_HEIGHT, this.difficultyLevel);
            const canvasRect = this.canvas.getBoundingClientRect();
            this.player2.update(this.keys, currentTime, this.touchControls, null, canvasRect.height, this.difficultyLevel);
        }
        
        this.ball.update(currentTime);
        
        // Update extra balls
        this.extraBalls.forEach(eb => eb.update(currentTime));
        
        // Update helper paddles
        this.helperPaddles.forEach(hp => hp.update(this.extraBalls, currentTime));
        
        // Check paddle collisions
        if (this.ball.handlePaddleCollision(this.player1, currentTime, this.particleSystem)) {
            // Ball hit player 1's paddle
        }
        if (this.ball.handlePaddleCollision(this.player2, currentTime, this.particleSystem)) {
            // Ball hit player 2's paddle
        }
        
        // Helper paddle collisions
        this.helperPaddles.forEach(hp => {
            this.ball.handlePaddleCollision(hp, currentTime, this.particleSystem);
            this.extraBalls.forEach(eb => {
                eb.handlePaddleCollision(hp, currentTime, this.particleSystem);
            });
        });
        
        // Extra balls paddle collisions
        this.extraBalls.forEach(eb => {
            eb.handlePaddleCollision(this.player1, currentTime, this.particleSystem);
            eb.handlePaddleCollision(this.player2, currentTime, this.particleSystem);
        });
        
        // Check scoring
        this.checkScoring();
        
        // Update power-ups
        this.updatePowerUps(currentTime);
        
        // Update obstacles
        this.updateObstacles();
        
        // Update particles
        this.particleSystem.update();
        
        // Update status
        this.updateStatus();
    }
    
    updateDifficulty(currentTime) {
        if (currentTime - this.lastDifficultyIncrease > CONFIG.DIFFICULTY_INCREASE_INTERVAL) {
            this.difficultyLevel++;
            this.lastDifficultyIncrease = currentTime;
            
            // Increase ball speed slightly
            this.ball.dx *= CONFIG.SPEED_INCREASE_FACTOR;
            this.ball.dy *= CONFIG.SPEED_INCREASE_FACTOR;
            
            // Shrink paddles gradually as difficulty increases (harder to block)
            const shrinkFactor = 0.97; // Paddles get 3% smaller each level
            
            // Only shrink baseHeight (the normal size), not current height
            this.player1.baseHeight *= shrinkFactor;
            this.player2.baseHeight *= shrinkFactor;
            
            // If paddle doesn't have a size powerup active, also shrink current height
            if (this.player1.powerUp !== 'size') {
                this.player1.height = this.player1.baseHeight;
            }
            if (this.player2.powerUp !== 'size') {
                this.player2.height = this.player2.baseHeight;
            }
            
            // Minimum paddle size to keep game playable
            const minHeight = CONFIG.PADDLE_HEIGHT * 0.5; // Don't go below 50% of original
            if (this.player1.baseHeight < minHeight) {
                this.player1.baseHeight = minHeight;
                if (this.player1.powerUp !== 'size') {
                    this.player1.height = minHeight;
                }
            }
            if (this.player2.baseHeight < minHeight) {
                this.player2.baseHeight = minHeight;
                if (this.player2.powerUp !== 'size') {
                    this.player2.height = minHeight;
                }
            }
            
            // Spawn more obstacles
            if (this.obstaclesActive && this.obstacles.length < 6) {
                this.spawnObstacle();
            }
            
            // Visual feedback
            this.particleSystem.emit(
                CONFIG.CANVAS_WIDTH / 2,
                CONFIG.CANVAS_HEIGHT / 2,
                30,
                '#ff00ff'
            );
        }
    }
    
    checkScoring() {
        // Main ball
        if (this.ball.x - this.ball.radius <= 0) {
            // Ball went past left paddle - right player (player2) scores
            // Always 1 point, no combo bonus or multi-ball multipliers
            this.player2.score += 1;
            this.player1.combo = 0; // Reset losing player's combo
            // Clear freeze effects when point is scored
            this.player1.stunned = false;
            this.player2.stunned = false;
            this.updateScore();
            this.checkGameOver();
            this.ball.reset();
        } else if (this.ball.x + this.ball.radius >= CONFIG.CANVAS_WIDTH) {
            // Ball went past right paddle - left player (player1) scores
            // Always 1 point, no combo bonus or multi-ball multipliers
            this.player1.score += 1;
            this.player2.combo = 0; // Reset losing player's combo
            // Clear freeze effects when point is scored
            this.player1.stunned = false;
            this.player2.stunned = false;
            this.updateScore();
            this.checkGameOver();
            this.ball.reset();
        }
        
        // Extra balls - each worth only 1 point
        this.extraBalls = this.extraBalls.filter(eb => {
            if (eb.x - eb.radius <= 0) {
                this.player2.score += 1; // Always 1 point
                // Clear freeze effects when point is scored
                this.player1.stunned = false;
                this.player2.stunned = false;
                this.updateScore();
                return false;
            } else if (eb.x + eb.radius >= CONFIG.CANVAS_WIDTH) {
                this.player1.score += 1; // Always 1 point
                // Clear freeze effects when point is scored
                this.player1.stunned = false;
                this.player2.stunned = false;
                this.updateScore();
                return false;
            }
            return true;
        });
    }
    
    checkGameOver() {
        const totalScore = this.player1.score + this.player2.score;
        
        // Activate obstacles
        if (totalScore === CONFIG.OBSTACLE_SPAWN_SCORE && !this.obstaclesActive) {
            this.spawnObstacles();
        }
        
        // Check winner
        if (this.player1.score >= CONFIG.WINNING_SCORE) {
            this.handleMatchEnd(1);
        } else if (this.player2.score >= CONFIG.WINNING_SCORE) {
            this.handleMatchEnd(2);
        }
    }
    
    handleMatchEnd(winnerId) {
        if (this.gameMode === GAME_MODES.THREE_PLAYER && this.tournament) {
            // Record tournament match result
            this.tournament.recordMatchResult(winnerId);
            
            const status = this.tournament.getTournamentStatus();
            if (!status.complete) {
                // Prepare for next match
                this.prepareNextTournamentMatch();
            } else {
                // Tournament complete
                this.gameOver = true;
                this.running = false;
            }
        } else {
            // Regular game end
            this.gameOver = true;
            this.running = false;
        }
    }
    
    prepareNextTournamentMatch() {
        const nextMatch = this.tournament.getCurrentMatch();
        if (!nextMatch) return;
        
        // Reset scores
        this.player1.score = 0;
        this.player2.score = 0;
        
        // Update paddle colors for new players
        this.player1.color = nextMatch.player1.color;
        this.player2.color = nextMatch.player2.color;
        
        // Reset other game state
        this.player1.y = CONFIG.CANVAS_HEIGHT / 2 - CONFIG.PADDLE_HEIGHT / 2;
        this.player2.y = CONFIG.CANVAS_HEIGHT / 2 - CONFIG.PADDLE_HEIGHT / 2;
        this.player1.height = CONFIG.PADDLE_HEIGHT;
        this.player2.height = CONFIG.PADDLE_HEIGHT;
        this.player1.powerUp = null;
        this.player2.powerUp = null;
        this.player1.stunned = false;
        this.player2.stunned = false;
        this.player1.combo = 0;
        this.player2.combo = 0;
        
        this.ball.reset();
        this.extraBalls = [];
        this.powerUps = [];
        this.obstacles = [];
        this.obstaclesActive = false;
        this.particleSystem.clear();
        
        // Pause between matches
        this.running = false;
        this.updateScore();
        this.updateStatus();
    }
    
    updatePowerUps(currentTime) {
        // Spawn power-ups
        if (currentTime - this.lastPowerUpTime > CONFIG.POWERUP_SPAWN_INTERVAL && 
            this.powerUps.length < CONFIG.MAX_POWERUPS) {
            this.spawnPowerUp();
            this.lastPowerUpTime = currentTime;
        }
        
        // Update existing power-ups
        this.powerUps.forEach(pu => pu.update());
        
        // Check collisions with ball
        this.powerUps = this.powerUps.filter(pu => {
            if (pu.checkCollision(this.ball)) {
                this.applyPowerUp(pu, currentTime);
                this.particleSystem.emit(pu.x, pu.y, 20, pu.color);
                return false;
            }
            return true;
        });
    }
    
    spawnPowerUp() {
        const type = CONFIG.POWERUP_TYPES[Utils.randomInt(0, CONFIG.POWERUP_TYPES.length - 1)];
        const x = Utils.random(100, CONFIG.CANVAS_WIDTH - 100);
        const y = Utils.random(100, CONFIG.CANVAS_HEIGHT - 100);
        this.powerUps.push(new PowerUp(x, y, type));
    }
    
    applyPowerUp(powerUp, currentTime) {
        // Give power-up to the player on whose side it was collected
        // Player 1 is on the left (x < canvas width/2)
        // Player 2 is on the right (x > canvas width/2)
        const collectedOnLeftSide = this.ball.x < CONFIG.CANVAS_WIDTH / 2;
        const collectingPlayer = collectedOnLeftSide ? this.player1 : this.player2;
        const opponent = collectedOnLeftSide ? this.player2 : this.player1;
        
        // Visual feedback
        this.particleSystem.emit(powerUp.x, powerUp.y, 30, powerUp.color);
        
        switch(powerUp.type) {
            case 'speed':
                collectingPlayer.powerUp = 'speed';
                collectingPlayer.powerUpTime = currentTime;
                break;
            case 'size':
                collectingPlayer.powerUp = 'size';
                collectingPlayer.height = CONFIG.PADDLE_HEIGHT * 1.5;
                collectingPlayer.powerUpTime = currentTime;
                break;
            case 'freeze':
                opponent.stunned = true;
                opponent.stunnedTime = currentTime;
                break;
            case 'invisible':
                this.ball.invisible = true;
                this.ball.invisibleTime = currentTime;
                break;
            case 'multiball':
                this.createExtraBalls();
                break;
            case 'curve':
                this.ball.curved = true;
                setTimeout(() => this.ball.curved = false, CONFIG.POWERUP_DURATION);
                break;
            case 'slow':
                this.ball.slowMo = true;
                setTimeout(() => this.ball.slowMo = false, CONFIG.POWERUP_DURATION);
                break;
            case 'helper':
                this.spawnHelperPaddle(collectingPlayer, currentTime);
                break;
        }
    }
    
    spawnHelperPaddle(player, currentTime) {
        // Spawn helper next to the player's paddle
        const isLeftSide = player.x < CONFIG.CANVAS_WIDTH / 2;
        const helperX = isLeftSide ? player.x + 40 : player.x - 40;
        const helperY = CONFIG.CANVAS_HEIGHT / 2 - CONFIG.PADDLE_HEIGHT / 2;
        
        const helper = new HelperPaddle(helperX, helperY, player.color, this.ball);
        helper.spawnTime = currentTime;
        this.helperPaddles.push(helper);
        
        // Remove helper after duration
        setTimeout(() => {
            const index = this.helperPaddles.indexOf(helper);
            if (index > -1) {
                this.helperPaddles.splice(index, 1);
            }
        }, CONFIG.POWERUP_DURATION);
    }
    
    createExtraBalls() {
        for (let i = 0; i < 2; i++) {
            const eb = new Ball(this.ball.x, this.ball.y);
            eb.dx = (Math.random() > 0.5 ? 1 : -1) * Utils.random(4, 7);
            eb.dy = Utils.random(-4, 4);
            eb.color = CONFIG.COLORS.EXTRA_BALL;
            this.extraBalls.push(eb);
        }
    }
    
    updateObstacles() {
        if (!this.obstaclesActive) return;
        
        this.obstacles.forEach(obs => {
            obs.update();
            
            // Ball collision
            if (obs.checkCollision(this.ball)) {
                this.ball.dx *= -1;
                this.ball.dy *= -1;
                this.particleSystem.emit(this.ball.x, this.ball.y, 15, '#ff3333');
            }
            
            // Extra balls collision
            this.extraBalls.forEach(eb => {
                if (obs.checkCollision(eb)) {
                    eb.dx *= -1;
                    eb.dy *= -1;
                }
            });
        });
    }
    
    spawnObstacles() {
        for (let i = 0; i < CONFIG.OBSTACLE_COUNT; i++) {
            this.spawnObstacle();
        }
        this.obstaclesActive = true;
    }
    
    spawnObstacle() {
        const x = CONFIG.CANVAS_WIDTH / 2 - CONFIG.OBSTACLE_WIDTH / 2 + Utils.random(-150, 150);
        const y = Utils.random(50, CONFIG.CANVAS_HEIGHT - CONFIG.OBSTACLE_HEIGHT - 50);
        this.obstacles.push(new Obstacle(x, y));
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = CONFIG.COLORS.BACKGROUND;
        this.ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        
        // Draw center line
        this.drawCenterLine();
        
        // Draw game time and difficulty
        this.drawGameInfo();
        
        // Draw tournament standings if in 3-player mode
        if (this.gameMode === GAME_MODES.THREE_PLAYER && this.tournament) {
            this.drawTournamentStandings();
        }
        
        // Draw entities
        this.obstacles.forEach(obs => obs.draw(this.ctx));
        this.powerUps.forEach(pu => pu.draw(this.ctx));
        this.particleSystem.draw(this.ctx);
        this.player1.draw(this.ctx);
        this.player2.draw(this.ctx);
        this.helperPaddles.forEach(hp => hp.draw(this.ctx)); // Draw helper bots
        this.ball.draw(this.ctx);
        this.extraBalls.forEach(eb => eb.draw(this.ctx));
    }
    
    drawTournamentStandings() {
        const standings = this.tournament.getStandings();
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'left';
        
        const x = 10;
        let y = 60;
        
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText('Tournament Standings:', x, y);
        y += 15;
        
        standings.forEach((player, index) => {
            this.ctx.fillStyle = player.color;
            this.ctx.fillText(`${index + 1}. ${player.name}: ${player.points}pts (${player.wins}W-${player.losses}L)`, x, y);
            y += 15;
        });
    }
    
    drawCenterLine() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(CONFIG.CANVAS_WIDTH / 2, 0);
        this.ctx.lineTo(CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }
    
    drawGameInfo() {
        this.ctx.font = '14px Arial';
        this.ctx.fillStyle = '#fff';
        this.ctx.textAlign = 'center';
        
        const timeStr = Utils.formatTime(this.elapsedTime);
        this.ctx.fillText(`⏱️ ${timeStr}`, CONFIG.CANVAS_WIDTH / 2, 20);
        
        if (this.difficultyLevel > 1) {
            this.ctx.fillText(`⚡ Level ${this.difficultyLevel}`, CONFIG.CANVAS_WIDTH / 2, 40);
        }
    }
    
    updateScore() {
        document.getElementById('score1').textContent = this.player1.score;
        document.getElementById('score2').textContent = this.player2.score;
    }
    
    updateStatus() {
        const statusDiv = document.getElementById('gameStatus');
        
        if (this.gameOver) {
            if (this.gameMode === GAME_MODES.THREE_PLAYER && this.tournament) {
                const winner = this.tournament.getWinner();
                const timeStr = Utils.formatTime(this.elapsedTime);
                statusDiv.textContent = `🏆 Tournament Winner: ${winner.name}! 🏆 Press R to play again`;
            } else if (this.gameMode === GAME_MODES.SINGLE_PLAYER) {
                // In single player: player1 = AI (left), player2 = Human (right)
                const winner = this.player2.score >= CONFIG.WINNING_SCORE ? 'You' : 'Computer';
                const timeStr = Utils.formatTime(this.elapsedTime);
                statusDiv.textContent = `🎉 ${winner} Win! Time: ${timeStr} 🎉 Press R to play again`;
            } else {
                const winner = this.player1.score >= CONFIG.WINNING_SCORE ? 'Player 1' : 'Player 2';
                const timeStr = Utils.formatTime(this.elapsedTime);
                statusDiv.textContent = `🎉 ${winner} Wins! Time: ${timeStr} 🎉 Press R to play again`;
            }
        } else if (this.gameMode === GAME_MODES.THREE_PLAYER && this.tournament) {
            const match = this.tournament.getCurrentMatch();
            const status = this.tournament.getTournamentStatus();
            if (match) {
                const title = match.title || `${match.player1.name} vs ${match.player2.name}`;
                statusDiv.textContent = this.running ? 
                    `🎮 Match ${status.current}/${status.total}: ${title}` :
                    `Press SPACE to start: ${title}`;
            }
        } else if (this.running) {
            let status = this.gameMode === GAME_MODES.SINGLE_PLAYER ? 
                'Game On! 🤖 vs 👤' : 'Game On! 🔥';
            if (this.player1.powerUp) {
                const pu = CONFIG.POWERUP_TYPES.find(p => p.type === this.player1.powerUp);
                status += ` | P1: ${pu.emoji}`;
            }
            if (this.player2.powerUp) {
                const pu = CONFIG.POWERUP_TYPES.find(p => p.type === this.player2.powerUp);
                status += ` | P2: ${pu.emoji}`;
            }
            if (this.ball.invisible) status += ' | 👻';
            if (this.ball.curved) status += ' | 🌀';
            if (this.ball.slowMo) status += ' | 🐌';
            statusDiv.textContent = status;
        } else {
            if (this.startTime === 0) {
                statusDiv.textContent = '🎮 Click anywhere, then press SPACE to start! 🎮';
            } else {
                statusDiv.textContent = 'PAUSED - Press SPACE to continue';
            }
        }
    }
    
    reset() {
        this.running = false;
        this.gameOver = false;
        this.startTime = 0;
        this.elapsedTime = 0;
        this.pausedTime = 0;
        this.lastPauseTime = 0;
        this.difficultyLevel = 1;
        this.lastDifficultyIncrease = 0;
        
        this.player1.score = 0;
        this.player2.score = 0;
        this.player1.y = CONFIG.CANVAS_HEIGHT / 2 - CONFIG.PADDLE_HEIGHT / 2;
        this.player2.y = CONFIG.CANVAS_HEIGHT / 2 - CONFIG.PADDLE_HEIGHT / 2;
        this.player1.height = CONFIG.PADDLE_HEIGHT;
        this.player2.height = CONFIG.PADDLE_HEIGHT;
        this.player1.powerUp = null;
        this.player2.powerUp = null;
        this.player1.stunned = false;
        this.player2.stunned = false;
        this.player1.combo = 0;
        this.player2.combo = 0;
        
        this.ball.reset();
        this.extraBalls = [];
        this.powerUps = [];
        this.obstacles = [];
        this.helperPaddles = []; // Clear support bots
        this.obstaclesActive = false;
        this.particleSystem.clear();
        this.lastPowerUpTime = Date.now();
        
        this.updateScore();
        this.updateStatus();
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    start() {
        this.lastPowerUpTime = Date.now();
        this.updateScore();
        this.updateStatus();
        this.gameLoop();
    }
}
