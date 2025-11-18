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
    
    singlePlayerBtn.onclick = () => {
        game.setGameMode(GAME_MODES.SINGLE_PLAYER);
        modeModal.style.display = 'none';
        updatePlayerNames('Player 1', 'Computer 🤖');
    };
    
    twoPlayerBtn.onclick = () => {
        game.setGameMode(GAME_MODES.TWO_PLAYER);
        modeModal.style.display = 'none';
        updatePlayerNames('Player 1', 'Player 2');
    };
    
    threePlayerBtn.onclick = () => {
        game.setGameMode(GAME_MODES.THREE_PLAYER);
        modeModal.style.display = 'none';
        updatePlayerNames('Player 1', 'Player 2');
    };
    
    helpBtn.onclick = () => {
        helpModal.style.display = 'block';
    };
    
    closeBtn.onclick = () => {
        helpModal.style.display = 'none';
    };
    
    resetBtn.onclick = () => {
        modeModal.style.display = 'block';
    };
    
    window.onclick = (event) => {
        if (event.target == helpModal) {
            helpModal.style.display = 'none';
        }
    };
    
    function updatePlayerNames(p1Name, p2Name) {
        document.getElementById('player1Name').textContent = p1Name;
        document.getElementById('player2Name').textContent = p2Name;
    }
    
    // Start the game
    game.start();
});
