// Main entry point
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const game = new Game(canvas);
    
    // Resize canvas to fit screen
    function resizeCanvas() {
        // Wait a bit for elements to render
        setTimeout(() => {
            const menuBar = document.querySelector('.menu-bar');
            const scoreboard = document.querySelector('.scoreboard');
            const gameStatus = document.getElementById('gameStatus');
            const mobileStartBtn = document.getElementById('mobileStartBtn');
            const mobileControls = document.querySelector('.mobile-controls');
            
            // Get actual heights of elements
            const menuBarHeight = menuBar ? menuBar.offsetHeight : 0;
            const scoreboardHeight = scoreboard ? scoreboard.offsetHeight : 0;
            const statusHeight = gameStatus ? gameStatus.offsetHeight : 0;
            
            // Check if mobile controls are visible
            const mobileControlsVisible = mobileControls && window.getComputedStyle(mobileControls).display !== 'none';
            const mobileStartVisible = mobileStartBtn && window.getComputedStyle(mobileStartBtn).display !== 'none';
            const mobileStartHeight = mobileStartVisible ? mobileStartBtn.offsetHeight + 20 : 0; // Add margin
            
            // Calculate available space - use almost all of it!
            // Only subtract the actual UI elements, minimal padding
            const usedHeight = menuBarHeight + scoreboardHeight + statusHeight + mobileStartHeight;
            const availableHeight = window.innerHeight - usedHeight - 10; // Just 10px total padding
            const availableWidth = window.innerWidth - 10; // Just 10px total padding
            
            // Maintain 2:1 aspect ratio
            const aspectRatio = 2;
            let canvasWidth = availableWidth;
            let canvasHeight = canvasWidth / aspectRatio;
            
            // If height would be too tall, limit by height instead
            if (canvasHeight > availableHeight) {
                canvasHeight = availableHeight;
                canvasWidth = canvasHeight * aspectRatio;
            }
            
            // Make sure we use at least 90% of available space
            const heightUsage = canvasHeight / availableHeight;
            if (heightUsage < 0.9 && availableHeight > 200) {
                canvasHeight = availableHeight * 0.98;
                canvasWidth = canvasHeight * aspectRatio;
                
                // If width is now too wide, scale back down
                if (canvasWidth > availableWidth) {
                    canvasWidth = availableWidth * 0.98;
                    canvasHeight = canvasWidth / aspectRatio;
                }
            }
            
            // Ensure minimum size
            if (canvasWidth < 300) canvasWidth = 300;
            if (canvasHeight < 150) canvasHeight = 150;
            
            // Set canvas display size (CSS)
            canvas.style.width = Math.floor(canvasWidth) + 'px';
            canvas.style.height = Math.floor(canvasHeight) + 'px';
        }, 100); // Increased delay for orientation changes
    }
    
    // Initial resize
    resizeCanvas();
    
    // Resize on window resize or orientation change
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('orientationchange', () => {
        setTimeout(resizeCanvas, 100);
    });
    
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
    const mobileControlSelection = document.getElementById('mobileControlSelection');
    const arrowKeysBtn = document.getElementById('arrowKeysBtn');
    const wasdKeysBtn = document.getElementById('wasdKeysBtn');
    const touchDragBtn = document.getElementById('touchDragBtn');
    const touchButtonsBtn = document.getElementById('touchButtonsBtn');
    
    singlePlayerBtn.onclick = () => {
        // Check if mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 900;
        
        if (isMobile) {
            // On mobile, show mobile control selection
            document.querySelector('.mode-selection').style.display = 'none';
            document.querySelector('.mode-description').style.display = 'none';
            mobileControlSelection.style.display = 'block';
        } else {
            // On desktop, show control scheme selection
            document.querySelector('.mode-selection').style.display = 'none';
            document.querySelector('.mode-description').style.display = 'none';
            controlSchemeSelection.style.display = 'block';
        }
    };
    
    // Mobile touch drag control
    touchDragBtn.onclick = () => {
        game.setGameMode(GAME_MODES.SINGLE_PLAYER, CONFIG.CONTROL_SCHEMES.ARROWS, true);
        modeModal.style.display = 'none';
        resetModeModal();
        updatePlayerNames('Computer 🤖', 'Player');
        updateControlDisplay('W/S Keys', 'Touch & Drag');
        // Hide button controls, enable drag
        document.getElementById('mobileControls').style.display = 'none';
    };
    
    // Mobile button controls
    touchButtonsBtn.onclick = () => {
        game.setGameMode(GAME_MODES.SINGLE_PLAYER, CONFIG.CONTROL_SCHEMES.ARROWS, false);
        modeModal.style.display = 'none';
        resetModeModal();
        updatePlayerNames('Computer 🤖', 'Player');
        updateControlDisplay('W/S Keys', 'Touch Buttons');
        // Show button controls
        document.getElementById('mobileControls').style.display = 'flex';
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
        mobileControlSelection.style.display = 'none';
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
