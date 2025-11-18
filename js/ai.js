// AI Player Controller
class AIPlayer {
    constructor(paddle, difficulty = 'MEDIUM') {
        this.paddle = paddle;
        this.difficulty = CONFIG.AI_DIFFICULTY_LEVELS[difficulty];
        this.targetY = paddle.y + paddle.height / 2;
        this.reactionDelay = 0;
        this.lastUpdateTime = 0;
    }
    
    update(ball, currentTime, extraBalls = []) {
        // Update reaction delay
        if (currentTime - this.lastUpdateTime > 100) {
            this.lastUpdateTime = currentTime;
            
            // Find the closest ball to track
            let closestBall = ball;
            let closestDist = Math.abs(ball.x - this.paddle.x);
            
            extraBalls.forEach(eb => {
                const dist = Math.abs(eb.x - this.paddle.x);
                if (dist < closestDist) {
                    closestBall = eb;
                    closestDist = dist;
                }
            });
            
            // Only track balls coming towards AI
            const ballComingTowardsAI = this.paddle.x > CONFIG.CANVAS_WIDTH / 2 ? 
                closestBall.dx > 0 : closestBall.dx < 0;
            
            if (ballComingTowardsAI) {
                // Predict where the ball will be
                const predictedY = this.predictBallY(closestBall);
                
                // Add some error based on difficulty
                const error = (Math.random() - 0.5) * CONFIG.AI_ERROR_MARGIN * (1 - this.difficulty.accuracy);
                this.targetY = predictedY + error;
            } else {
                // Return to center when ball is moving away
                this.targetY = CONFIG.CANVAS_HEIGHT / 2;
            }
        }
        
        // Move paddle towards target
        const paddleCenter = this.paddle.y + this.paddle.height / 2;
        const diff = this.targetY - paddleCenter;
        const speed = CONFIG.PADDLE_SPEED * this.difficulty.speed;
        
        if (Math.abs(diff) > 5) {
            this.paddle.dy = diff > 0 ? speed : -speed;
        } else {
            this.paddle.dy = 0;
        }
        
        // Update paddle position
        this.paddle.y += this.paddle.dy;
        this.paddle.y = Utils.clamp(this.paddle.y, 0, CONFIG.CANVAS_HEIGHT - this.paddle.height);
    }
    
    predictBallY(ball) {
        // Simple prediction: where will ball be when it reaches paddle?
        const timeToReach = Math.abs(ball.x - this.paddle.x) / Math.abs(ball.dx);
        let predictedY = ball.y + ball.dy * timeToReach;
        
        // Account for wall bounces
        while (predictedY < 0 || predictedY > CONFIG.CANVAS_HEIGHT) {
            if (predictedY < 0) {
                predictedY = -predictedY;
            } else if (predictedY > CONFIG.CANVAS_HEIGHT) {
                predictedY = 2 * CONFIG.CANVAS_HEIGHT - predictedY;
            }
        }
        
        return predictedY;
    }
    
    setDifficulty(difficulty) {
        this.difficulty = CONFIG.AI_DIFFICULTY_LEVELS[difficulty];
    }
}
