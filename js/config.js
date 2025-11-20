// Game Configuration
const CONFIG = {
    // Canvas
    CANVAS_WIDTH: 1200,
    CANVAS_HEIGHT: 600,
    
    // Game Rules
    WINNING_SCORE: 10,
    
    // Paddle
    PADDLE_WIDTH: 15,
    PADDLE_HEIGHT: 100,
    PADDLE_SPEED: 8,
    PADDLE_OFFSET: 10,
    
    // Ball
    BALL_RADIUS: 8,
    BALL_INITIAL_SPEED: 5,
    BALL_MAX_SPEED: 18,
    BALL_SPEED_INCREMENT: 1.05,
    
    // Power-ups
    POWERUP_RADIUS: 15,
    POWERUP_SPAWN_INTERVAL: 8000,
    POWERUP_DURATION: 5000,
    FREEZE_DURATION: 3000,
    INVISIBLE_DURATION: 4000,
    MAX_POWERUPS: 2,
    
    // Obstacles
    OBSTACLE_WIDTH: 15,
    OBSTACLE_HEIGHT: 60,
    OBSTACLE_SPEED: 2,
    OBSTACLE_COUNT: 3,
    OBSTACLE_SPAWN_SCORE: 5,
    
    // Difficulty Scaling
    DIFFICULTY_INCREASE_INTERVAL: 30000, // Every 30 seconds
    SPEED_INCREASE_FACTOR: 1.1,
    
    // AI Settings
    AI_REACTION_SPEED: 4,
    AI_ERROR_MARGIN: 15,
    AI_DIFFICULTY_LEVELS: {
        VERY_EASY: { speed: 0.4, accuracy: 0.5 },
        EASY: { speed: 0.55, accuracy: 0.65 },
        MEDIUM: { speed: 0.75, accuracy: 0.8 },
        HARD: { speed: 0.9, accuracy: 0.92 },
        EXPERT: { speed: 1.0, accuracy: 0.98 }
    },
    
    // Key Codes (language-independent)
    KEYS: {
        W: 'KeyW',
        S: 'KeyS',
        ARROW_UP: 'ArrowUp',
        ARROW_DOWN: 'ArrowDown',
        SPACE: 'Space',
        R: 'KeyR',
        QUESTION: 'Slash', // ? key
        ESCAPE: 'Escape'
    },
    
    // Control Schemes
    CONTROL_SCHEMES: {
        ARROWS: 'arrows',
        WASD: 'wasd'
    },
    
    // Colors
    COLORS: {
        PLAYER1: '#ff6b6b',
        PLAYER2: '#4ecdc4',
        PLAYER3: '#f39c12',
        BALL: '#ffd700',
        EXTRA_BALL: '#ff00ff',
        BACKGROUND: '#1a1a2e'
    },
    
    // Power-up Types
    POWERUP_TYPES: [
        { type: 'speed', color: '#ff00ff', emoji: '⚡', description: 'Super Speed!' },
        { type: 'size', color: '#00ff00', emoji: '📏', description: 'Bigger Paddle!' },
        { type: 'freeze', color: '#00ffff', emoji: '❄️', description: 'Freeze Opponent!' },
        { type: 'invisible', color: '#888888', emoji: '👻', description: 'Invisible Ball!' },
        { type: 'multiball', color: '#ff6600', emoji: '🎯', description: 'Multi-Ball!' },
        { type: 'curve', color: '#ffff00', emoji: '🌀', description: 'Curve Ball!' },
        { type: 'slow', color: '#9b59b6', emoji: '🐌', description: 'Slow Motion!' },
        { type: 'helper', color: '#00ff88', emoji: '🤖', description: 'Support Bot!' }
    ]
};

// Game Modes
const GAME_MODES = {
    SINGLE_PLAYER: 'single',
    TWO_PLAYER: 'two',
    THREE_PLAYER: 'three'
};
