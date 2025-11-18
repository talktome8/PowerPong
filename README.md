# 🎮 Advanced Couples Pong Game

A feature-rich, modular 2-player Pong game with **3 game modes**, power-ups, progressive difficulty, and advanced ball physics! Works with **all keyboard languages** (Hebrew, Arabic, etc.)!

## 🌟 Game Modes

### 🤖 Single Player
- Play against smart AI opponent
- AI predicts ball trajectory and adapts to your play style
- Perfect for practice or when playing alone

### 👥 Two Players (Classic)
- Traditional head-to-head competition
- Local multiplayer on one keyboard
- First to 10 points wins!

### 🏆 Three Player Tournament
- **Round-robin format**: Each player faces every other player
- **Dynamic matchmaking**: Special battles based on performance
- **Championship matches**: 2nd and 3rd place battle for redemption
- **Grudge matches**: Losers team up for revenge!
- **Point system**: 3 points per win, tracks wins/losses
- Epic tournament with automatic bracket generation

## 🌍 **Keyboard Language Support**

**Works with ANY keyboard layout!** 
- Hebrew ✅
- Arabic ✅
- Russian ✅  
- Chinese ✅
- Any language ✅

Uses physical key positions instead of characters, so W/S and Arrow keys work regardless of your keyboard language setting!

## 🌟 Features

### Core Gameplay
- **Advanced Ball Control**: Hit different parts of your paddle to control ball direction
  - Top of paddle → Ball goes UP ⬆️
  - Center → Ball goes STRAIGHT ➡️
  - Bottom → Ball goes DOWN ⬇️
- **Aim for Power-ups**: Use directional control to strategically collect power-ups
- **Timer System**: Track how long your matches take (MM:SS format)
- **Progressive Difficulty**: Game gets harder every 30 seconds
- **Combo System**: Chain paddle hits for multiplier bonuses

### Power-Ups (7 Types)
- ⚡ **Super Speed** - Move 80% faster (5s)
- 📏 **Bigger Paddle** - 50% larger (5s)
- ❄️ **Freeze** - Stun opponent (3s)
- 👻 **Invisible Ball** - Ball becomes nearly invisible (4s)
- 🎯 **Multi-Ball** - Spawn 2 extra balls
- 🌀 **Curve Ball** - Unpredictable curve physics (5s)
- 🐌 **Slow Motion** - Slows down ball (5s)

### Dynamic Elements
- 🧱 **Moving Obstacles** - Appear after 5 total points, bounce around the field
- ✨ **Particle Effects** - Visual feedback on every hit
- 🌟 **Ball Trails** - Better visual tracking
- 📊 **Difficulty Scaling** - Speed increases, more obstacles spawn
- 🎲 **Random Elements** - Keeps every game unique

## 🎯 How to Play

1. **Open the game:** Double-click `index.html`
2. **Player 1 (Left):** W (up) / S (down)
3. **Player 2 (Right):** Arrow Up / Arrow Down
4. **Press SPACE** to start/pause
5. **Press R** to restart
6. **Press ?** for help menu

## 📁 Project Structure (Modular Architecture)

```
dagig/
├── index.html          # Main HTML file with mode selection
├── style.css           # Styling with mode menu
├── js/
│   ├── config.js       # Game configuration & constants
│   ├── utils.js        # Utility functions
│   ├── particles.js    # Particle system for effects
│   ├── entities.js     # Game entities (Paddle, Ball, PowerUp, Obstacle)
│   ├── ai.js           # AI player logic with ball prediction
│   ├── tournament.js   # Tournament manager for 3-player mode
│   ├── game.js         # Main game logic & state management
│   └── main.js         # Entry point & mode selection
├── README.md           # This file
└── ARCHITECTURE.md     # Technical architecture details
```

## 🎮 Gameplay Tips

- **Control is Key**: Master hitting different parts of your paddle to control ball direction
- **Power-up Strategy**: Position yourself to intercept power-ups
- **Watch the Timer**: Difficulty increases every 30 seconds
- **Combo Bonus**: Keep hitting the ball to build combos
- **Obstacle Navigation**: After 5 points, moving obstacles add extra challenge

## 🏆 Win Condition

First to **10 points** wins! Final time is displayed when game ends.

---

Built with ❤️ for you and your girlfriend to enjoy together!
Modular, maintainable, and fun! 🎉
