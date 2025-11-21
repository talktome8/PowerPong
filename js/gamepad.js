// Gamepad Controller Manager
class GamepadManager {
    constructor() {
        this.gamepads = {};
        this.playerAssignments = {
            player1: null, // Gamepad index for player 1
            player2: null  // Gamepad index for player 2
        };
        this.deadzone = 0.15; // Ignore small stick movements
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        window.addEventListener('gamepadconnected', (e) => {
            console.log('Gamepad connected:', e.gamepad.id);
            this.gamepads[e.gamepad.index] = e.gamepad;
            this.showGamepadNotification(`🎮 Gamepad ${e.gamepad.index + 1} connected: ${e.gamepad.id}`);
            
            // Auto-assign to first available player
            if (this.playerAssignments.player1 === null) {
                this.assignGamepad('player1', e.gamepad.index);
            } else if (this.playerAssignments.player2 === null) {
                this.assignGamepad('player2', e.gamepad.index);
            }
        });
        
        window.addEventListener('gamepaddisconnected', (e) => {
            console.log('Gamepad disconnected:', e.gamepad.id);
            this.showGamepadNotification(`🎮 Gamepad ${e.gamepad.index + 1} disconnected`);
            
            // Unassign if this gamepad was assigned
            if (this.playerAssignments.player1 === e.gamepad.index) {
                this.playerAssignments.player1 = null;
            }
            if (this.playerAssignments.player2 === e.gamepad.index) {
                this.playerAssignments.player2 = null;
            }
            
            delete this.gamepads[e.gamepad.index];
        });
    }
    
    assignGamepad(player, gamepadIndex) {
        this.playerAssignments[player] = gamepadIndex;
        const gamepad = this.gamepads[gamepadIndex];
        if (gamepad) {
            this.showGamepadNotification(`🎮 Gamepad ${gamepadIndex + 1} assigned to ${player === 'player1' ? 'Player 1' : 'Player 2'}`);
        }
    }
    
    showGamepadNotification(message) {
        const statusDiv = document.getElementById('gameStatus');
        if (statusDiv) {
            const originalText = statusDiv.textContent;
            statusDiv.textContent = message;
            setTimeout(() => {
                // Only restore if the message is still showing
                if (statusDiv.textContent === message) {
                    statusDiv.textContent = originalText;
                }
            }, 2000);
        }
    }
    
    update() {
        // Poll gamepad state (browsers require polling)
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        
        for (let i = 0; i < gamepads.length; i++) {
            if (gamepads[i]) {
                this.gamepads[gamepads[i].index] = gamepads[i];
            }
        }
    }
    
    getPlayerInput(player) {
        this.update();
        
        const gamepadIndex = this.playerAssignments[player];
        if (gamepadIndex === null) return { up: false, down: false };
        
        const gamepad = this.gamepads[gamepadIndex];
        if (!gamepad) return { up: false, down: false };
        
        let up = false;
        let down = false;
        
        // Check D-Pad (buttons 12 and 13 on most controllers)
        if (gamepad.buttons[12] && gamepad.buttons[12].pressed) up = true;
        if (gamepad.buttons[13] && gamepad.buttons[13].pressed) down = true;
        
        // Check Left Stick Y-axis (axis 1 on most controllers)
        if (gamepad.axes[1] !== undefined) {
            const yAxis = gamepad.axes[1];
            if (yAxis < -this.deadzone) up = true;
            if (yAxis > this.deadzone) down = true;
        }
        
        // Check Right Stick Y-axis (axis 3 on most controllers) as backup
        if (gamepad.axes[3] !== undefined) {
            const yAxis = gamepad.axes[3];
            if (yAxis < -this.deadzone) up = true;
            if (yAxis > this.deadzone) down = true;
        }
        
        return { up, down };
    }
    
    isGamepadConnected(player) {
        const gamepadIndex = this.playerAssignments[player];
        return gamepadIndex !== null && this.gamepads[gamepadIndex] !== undefined;
    }
    
    getConnectedGamepads() {
        return Object.values(this.gamepads).filter(gp => gp !== null);
    }
}
