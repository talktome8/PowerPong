// Main entry point
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const game = new Game(canvas);
    
    // Make sure the page has focus for keyboard input
    window.focus();
    document.body.focus();
    
    // Click canvas to ensure focus
    canvas.addEventListener('click', () => {
        canvas.focus();
    });
    
    // Make canvas focusable
    canvas.tabIndex = 1;
    
    // Setup UI event listeners
    const helpBtn = document.getElementById('helpBtn');
    const resetBtn = document.getElementById('resetBtn');
    const helpModal = document.getElementById('helpModal');
    const modeModal = document.getElementById('modeModal');
    const closeBtn = document.getElementsByClassName('close')[0];
    
    // Mode selection buttons
    const singlePlayerBtn = document.getElementById('singlePlayerBtn');
    const twoPlayerBtn = document.getElementById('twoPlayerBtn');
    const threePlayerBtn = document.getElementById('threePlayerBtn');
    
    // Control scheme selection
    const controlSchemeSelection = document.getElementById('controlSchemeSelection');
    const arrowKeysBtn = document.getElementById('arrowKeysBtn');
    const wasdKeysBtn = document.getElementById('wasdKeysBtn');
    
    singlePlayerBtn.onclick = () => {
        // Check if mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 900;
        
        if (isMobile) {
            // On mobile, skip control selection and use touch controls
            game.setGameMode(GAME_MODES.SINGLE_PLAYER, CONFIG.CONTROL_SCHEMES.ARROWS);
            modeModal.style.display = 'none';
            resetModeModal();
            updatePlayerNames('Computer 🤖', 'Player');
            updateControlDisplay('W/S Keys', 'Touch Controls');
        } else {
            // On desktop, show control scheme selection
            document.querySelector('.mode-selection').style.display = 'none';
            document.querySelector('.mode-description').style.display = 'none';
            controlSchemeSelection.style.display = 'block';
        }
    };
    
    arrowKeysBtn.onclick = () => {
        game.setGameMode(GAME_MODES.SINGLE_PLAYER, CONFIG.CONTROL_SCHEMES.ARROWS);
        modeModal.style.display = 'none';
        resetModeModal();
        updatePlayerNames('Computer 🤖', 'Player');
        updateControlDisplay('W/S Keys', 'Arrow Keys');
    };
    
    wasdKeysBtn.onclick = () => {
        game.setGameMode(GAME_MODES.SINGLE_PLAYER, CONFIG.CONTROL_SCHEMES.WASD);
        modeModal.style.display = 'none';
        resetModeModal();
        updatePlayerNames('Computer 🤖', 'Player');
        updateControlDisplay('W/S Keys', 'W/S Keys');
    };
    
    twoPlayerBtn.onclick = () => {
        game.setGameMode(GAME_MODES.TWO_PLAYER);
        modeModal.style.display = 'none';
        resetModeModal();
        updatePlayerNames('Player 1', 'Player 2');
        updateControlDisplay('W/S Keys', '↑/↓ Keys');
    };
    
    threePlayerBtn.onclick = () => {
        game.setGameMode(GAME_MODES.THREE_PLAYER);
        modeModal.style.display = 'none';
        resetModeModal();
        updatePlayerNames('Player 1', 'Player 2');
        updateControlDisplay('W/S Keys', '↑/↓ Keys');
    };
    
    function resetModeModal() {
        // Reset modal view for next time
        document.querySelector('.mode-selection').style.display = 'grid';
        document.querySelector('.mode-description').style.display = 'block';
        controlSchemeSelection.style.display = 'none';
    }
    
    function updatePlayerNames(p1Name, p2Name) {
        document.getElementById('player1Name').textContent = p1Name;
        document.getElementById('player2Name').textContent = p2Name;
    }
    
    function updateControlDisplay(p1Controls, p2Controls) {
        const controlElements = document.querySelectorAll('.controls');
        if (controlElements[0]) controlElements[0].textContent = p1Controls || 'W/S Keys';
        if (controlElements[1]) controlElements[1].textContent = p2Controls || '↑/↓ Keys';
    }
    
    helpBtn.onclick = () => {
        helpModal.style.display = 'block';
    };
    
    closeBtn.onclick = () => {
        helpModal.style.display = 'none';
    };
    
    resetBtn.onclick = () => {
        modeModal.style.display = 'block';
        resetModeModal();
    };
    
    window.onclick = (event) => {
        if (event.target == helpModal) {
            helpModal.style.display = 'none';
        }
    };
    
    // Start the game
    game.start();
});
