# 🏗️ Game Architecture

## Module Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        index.html                           │
│                    (Entry Point + UI)                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         main.js                             │
│              (Initialization & Event Setup)                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         game.js                             │
│           (Main Game Loop & State Management)               │
│                                                             │
│  • Game state (running, paused, gameOver)                  │
│  • Timer & difficulty progression                          │
│  • Update/Render loop                                      │
│  • Collision detection                                     │
│  • Power-up management                                     │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┼─────────┐
                    ▼         ▼         ▼
        ┌───────────────┬─────────┬──────────────┐
        │               │         │              │
        ▼               ▼         ▼              ▼
┌────────────┐  ┌────────────┐  ┌──────┐  ┌──────────┐
│ entities.js│  │particles.js│  │utils │  │ config   │
│            │  │            │  │ .js  │  │  .js     │
│ • Paddle   │  │ • Particle │  │      │  │          │
│ • Ball     │  │ • Particle │  │Utils │  │ CONFIG   │
│ • PowerUp  │  │   System   │  │funcs │  │constants │
│ • Obstacle │  │            │  │      │  │          │
└────────────┘  └────────────┘  └──────┘  └──────────┘
```

## Data Flow

```
User Input (Keyboard)
        ↓
    main.js (captures events)
        ↓
    game.js (processes input)
        ↓
  entities.js (updates positions)
        ↓
  particles.js (visual effects)
        ↓
    game.js (renders to canvas)
        ↓
    Screen Output
```

## Key Features by Module

### config.js
- All game constants
- Power-up definitions
- Difficulty settings
- Color schemes

### utils.js
- Distance calculations
- Collision detection helpers
- Time formatting
- Random number generation

### particles.js
- Particle class
- ParticleSystem for managing effects
- Visual feedback on hits

### entities.js
- **Paddle**: Player control, power-ups, combos
- **Ball**: Physics, directional control, effects
- **PowerUp**: Spawning, rotation, collision
- **Obstacle**: Movement, ball deflection

### game.js
- Main game loop
- State management
- Timer system
- Difficulty progression
- Score tracking
- Power-up application

### main.js
- DOM initialization
- Event listener setup
- Game instantiation

## Directional Ball Control

```
Paddle Hit Position → Ball Direction

    ┌─────┐
    │  ▲  │ ← Hit top    → Ball goes UP (negative dy)
    ├─────┤
    │  →  │ ← Hit center → Ball goes STRAIGHT (dy ≈ 0)
    ├─────┤
    │  ▼  │ ← Hit bottom → Ball goes DOWN (positive dy)
    └─────┘

Formula: hitPos = (ballY - paddleCenter) / (paddleHeight/2)
         angle = hitPos * maxAngle (60°)
         dy = sin(angle) * |dx|
```

## Benefits of Modular Design

✅ **Maintainability**: Easy to find and fix bugs
✅ **Scalability**: Add new features without breaking existing code
✅ **Readability**: Clear separation of concerns
✅ **Testability**: Individual modules can be tested independently
✅ **Reusability**: Utils and entities can be reused in other projects
✅ **Performance**: Only load what you need, easier to optimize
