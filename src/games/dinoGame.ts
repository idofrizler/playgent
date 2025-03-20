import { CopilotGame } from '../gameInterface';

/**
 * Enhanced dinosaur jumping game similar to Chrome's offline game
 */
export class DinoGame implements CopilotGame {
    id = 'dino-game';
    name = 'Dino Runner';
    description = 'Jump over obstacles with the spacebar';
    
    getHtmlContent(): string {
        return `
        <div class="game-world">
            <div class="sky">
                <div class="cloud cloud1"></div>
                <div class="cloud cloud2"></div>
                <div class="cloud cloud3"></div>
                <div class="sun"></div>
            </div>
            <div class="game-container" id="gameContainer">
                <div class="score-display">
                    <div class="score">Score: <span id="score">0</span></div>
                    <div class="top-score">Best: <span id="topScore">0</span></div>
                </div>
                <div class="dino" id="dino">
                    <div class="eye"></div>
                    <div class="mouth"></div>
                    <div class="leg leg-left"></div>
                    <div class="leg leg-right"></div>
                    <div class="arm"></div>
                    <div class="tail"></div>
                </div>
                <div class="ground"></div>
                <div class="cactus obstacle" id="obstacle"></div>
                <div class="initial-message" id="initialMessage">Press SPACE to Start</div>
            </div>
            <div class="final-score" id="finalScore">Game Over<br><span id="finalScoreValue">0</span></div>
            <div class="controls">
                <div class="control-hint">SPACE: Jump</div>
            </div>
        </div>
        `;
    }
    
    getCssContent(): string {
        return `
        /* Reset specific to VS Code webview */
        .game-world * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        .game-world {
            width: 100%;
            max-width: 800px;
            height: 100%;
            max-height: 800px;
            margin: 20px auto;
            position: relative;
            display: flex;
            flex-direction: column;
        }
        
        .sky {
            position: relative;
            width: 100%;
            height: 100px;
            background: linear-gradient(to bottom, #65a9f0, #afe2ff);
            border-radius: 8px 8px 0 0;
            overflow: hidden;
            display: block;
            margin: 0;
            padding: 0;
        }
        
        .game-container {
            width: 100%;
            height: 320px; /* Adjusted height */
            background-color: #f5f5f5;
            position: relative;
            overflow: hidden;
            border-radius: 0 0 8px 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            border: 2px solid #e0e0e0;
            margin: 0;
            padding: 0;
            display: block;
        }
        
        .sun {
            position: absolute;
            width: 40px;
            height: 40px;
            background: #ffeb3b;
            border-radius: 50%;
            top: 15px;
            right: 60px;
            box-shadow: 0 0 20px rgba(255, 235, 59, 0.7);
        }
        
        .cloud {
            position: absolute;
            background: #fff;
            border-radius: 20px;
        }
        
        .cloud:before, .cloud:after {
            content: '';
            position: absolute;
            background: #fff;
            border-radius: 50%;
        }
        
        .cloud1 {
            width: 60px;
            height: 20px;
            top: 20px;
            left: 20px;
            opacity: 0.9;
            animation: cloudMove1 30s linear infinite;
        }
        
        .cloud1:before {
            width: 30px;
            height: 30px;
            top: -15px;
            left: 10px;
        }
        
        .cloud1:after {
            width: 20px;
            height: 20px;
            top: -10px;
            right: 10px;
        }
        
        .cloud2 {
            width: 50px;
            height: 20px;
            top: 35px;
            left: 180px;
            opacity: 0.7;
            animation: cloudMove2 40s linear infinite;
        }
        
        .cloud2:before {
            width: 25px;
            height: 25px;
            top: -12px;
            left: 8px;
        }
        
        .cloud2:after {
            width: 15px;
            height: 15px;
            top: -8px;
            right: 8px;
        }
        
        .cloud3 {
            width: 55px;
            height: 22px;
            top: 15px;
            left: 300px;
            opacity: 0.8;
            animation: cloudMove3 50s linear infinite;
        }
        
        .cloud3:before {
            width: 26px;
            height: 26px;
            top: -13px;
            left: 10px;
        }
        
        .cloud3:after {
            width: 18px;
            height: 18px;
            top: -9px;
            right: 10px;
        }
        
        @keyframes cloudMove1 {
            from { left: -100px; }
            to { left: 100%; }
        }
        
        @keyframes cloudMove2 {
            from { left: -80px; }
            to { left: 100%; }
        }
        
        @keyframes cloudMove3 {
            from { left: -120px; }
            to { left: 100%; }
        }
        
        .ground {
            position: absolute;
            width: 100%;
            height: 30px; /* Reduced from 60px to 30px */
            background: linear-gradient(to bottom, #a67c52, #7d5a3c);
            bottom: 0;
        }
        
        .ground:before {
            content: '';
            position: absolute;
            width: 100%;
            height: 6px; /* Reduced from 10px to 6px */
            background: #8B4513;
            bottom: 0;
            opacity: 0.5;
        }
        
        .dino {
            width: 44px; /* Slightly adjusted for better proportions */
            height: 60px; /* Kept same height */
            background-color: #526e33; /* More dinosaur-like green color */
            position: absolute;
            left: 50px;
            border-radius: 50% 60% 20% 20%; /* Adjusted for dino-like shape */
            transition: transform 0.05s;
            z-index: 100; /* Ensure dino is above other elements */
        }
        
        .dino .eye {
            width: 8px;
            height: 8px;
            background-color: white;
            border-radius: 50%;
            position: absolute;
            top: 10px;
            right: 8px;
        }
        
        .dino .eye:after {
            content: '';
            width: 4px;
            height: 4px;
            background-color: black;
            border-radius: 50%;
            position: absolute;
            top: 2px;
            right: 1px;
        }
        
        .dino .mouth {
            width: 20px;
            height: 6px;
            background-color: #b33a3a;
            position: absolute;
            bottom: 16px;
            right: 0;
            border-radius: 0 0 10px 10px;
        }
        
        .dino .leg {
            width: 10px;
            height: 20px;
            background-color: #425a29; /* Matching green */
            position: absolute;
            bottom: -20px;
            border-radius: 5px;
        }
        
        .dino .leg-left {
            left: 8px;
        }
        
        .dino .leg-right {
            right: 8px;
        }
        
        .dino .arm {
            width: 8px;
            height: 12px;
            background-color: #425a29; /* Matching green */
            position: absolute;
            top: 28px;
            right: 5px;
            border-radius: 4px;
        }
        
        .dino .tail {
            width: 20px;
            height: 12px;
            background-color: #526e33; /* Same as dino body */
            position: absolute;
            top: 30px;
            left: -15px;
            border-radius: 10px 0 0 10px;
        }
        
        .dino.running .leg-left {
            animation: legMove 0.4s infinite;
        }
        
        .dino.running .leg-right {
            animation: legMove 0.4s infinite 0.2s;
        }
        
        @keyframes legMove {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
        }
        
        .obstacle {
            position: absolute;
            bottom: -110px; /* Position obstacles directly on the ground */
            right: 0px; /* Starting offscreen */
        }
        
        .cactus {
            width: 25px; /* Slightly smaller cactus */
            height: 60px; /* Slightly smaller cactus */
            background-color: #27ae60;
            border-radius: 5px;
            position: relative;
        }
        
        .cactus:before, .cactus:after {
            content: '';
            position: absolute;
            width: 12px;
            height: 25px;
            background-color: #27ae60;
            border-radius: 5px;
        }
        
        .cactus:before {
            top: 12px;
            left: -8px;
        }
        
        .cactus:after {
            top: 20px;
            right: -8px;
        }
        
        .score-display {
            position: absolute;
            top: 20px;
            right: 20px;
            font-family: 'Courier New', monospace;
            text-align: right;
        }
        
        .score, .top-score {
            font-size: 16px; /* Slightly smaller font */
            font-weight: bold;
            color: #333;
        }
        
        .top-score {
            color: #e67e22;
        }
        
        .final-score {
            display: none;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 28px; /* Slightly smaller font */
            font-weight: bold;
            color: #e74c3c;
            text-align: center;
            background-color: rgba(255, 255, 255, 0.9);
            padding: 15px 30px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            z-index: 10;
        }
        
        .initial-message {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 22px; /* Slightly smaller font */
            font-weight: bold;
            color: #333;
            text-align: center;
            animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 0.7; }
            50% { opacity: 1; }
        }
        
        .controls {
            display: flex;
            justify-content: center;
            margin-top: 10px;
            margin-bottom: 20px; /* Added bottom margin for spacing */
        }
        
        .control-hint {
            background-color: #f1f1f1;
            border-radius: 5px;
            padding: 5px 10px;
            font-size: 14px;
            margin: 0 5px;
            font-weight: bold;
            color: #333;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        `;
    }
    
    getJavaScriptContent(): string {
        return `
        const dino = document.getElementById('dino');
        const gameContainer = document.getElementById('gameContainer');
        const scoreDisplay = document.getElementById('score');
        const topScoreDisplay = document.getElementById('topScore');
        const finalScoreDisplay = document.getElementById('finalScore');
        const finalScoreValue = document.getElementById('finalScoreValue');
        const initialMessage = document.getElementById('initialMessage');
        const obstacle = document.getElementById('obstacle');
        
        let isJumping = false;
        let isGameRunning = false;
        let gravity = 0.9;
        let score = 0;
        let topScore = 0;
        let gameSpeed = 5;
        let obstacleInterval;
        let scoreInterval;

        // Define constants for game elements
        const GROUND_HEIGHT = 30;
        const CONTAINER_WIDTH = gameContainer ? gameContainer.offsetWidth : 800;
        const OBSTACLE_START_POSITION = -CONTAINER_WIDTH; // Starting position off-screen to the right, using container width

        // Load top score from local storage
        if (localStorage.getItem('dinoTopScore')) {
            topScore = parseInt(localStorage.getItem('dinoTopScore'));
            topScoreDisplay.textContent = topScore;
        }
        
        // Start game on spacebar
        document.addEventListener('keydown', function(event) {
            if (event.code === 'Space') {
                if (!isGameRunning) {
                    startGame();
                } else if (!isJumping) {
                    jump();
                }
                // Prevent page scrolling with spacebar
                event.preventDefault();
            }
        });
        
        // Start the game
        function startGame() {
            if (isGameRunning) return;
            
            isGameRunning = true;
            initialMessage.style.display = 'none';
            score = 0;
            scoreDisplay.textContent = '0';
            gameSpeed = 5; // Reset game speed on start
            
            // Add running animation to dino
            dino.classList.add('running');
            
            // Position dino on the ground
            dino.style.bottom = GROUND_HEIGHT + 'px';
            
            // Reset obstacle position - always start completely off-screen to the right
            obstacle.style.right = OBSTACLE_START_POSITION + 'px';
            
            // Start moving obstacles
            moveObstacles();
            
            // Start score counter
            scoreInterval = setInterval(function() {
                score++;
                scoreDisplay.textContent = score;
                
                // Increase game speed gradually
                if (score % 100 === 0) {
                    gameSpeed += 0.5;
                }
            }, 100);
        }
        
        // Game over function
        function gameOver() {
            isGameRunning = false;
            
            // Stop animations
            clearInterval(obstacleInterval);
            clearInterval(scoreInterval);
            dino.classList.remove('running');
            
            // Update top score if needed
            if (score > topScore) {
                topScore = score;
                localStorage.setItem('dinoTopScore', topScore);
                topScoreDisplay.textContent = topScore;
            }
            
            // Show game over message
            finalScoreValue.textContent = 'Score: ' + score;
            finalScoreDisplay.style.display = 'block';
            
            // Restart game after a delay
            setTimeout(() => {
                initialMessage.textContent = 'Press SPACE to Try Again';
                initialMessage.style.display = 'block';
                finalScoreDisplay.style.display = 'none';
            }, 2000);
        }
        
        // Move obstacles
        function moveObstacles() {
            // Get the container width for accurate positioning
            const containerWidth = gameContainer.offsetWidth;
            const obstacleWidth = obstacle.offsetWidth;
            
            // Initialize obstacle position starting from off-screen to the right
            let obstaclePos = OBSTACLE_START_POSITION;
            obstacle.style.right = obstaclePos + 'px';

            obstacleInterval = setInterval(function() {
                if (!isGameRunning) return;
                
                // Increment position with the current game speed
                obstaclePos += gameSpeed;
                
                // Reset obstacle when it goes off screen to the left
                if (obstaclePos > containerWidth + obstacleWidth) {
                    obstaclePos = OBSTACLE_START_POSITION; // Reset to starting position off-screen
                    obstacle.style.right = obstaclePos + 'px';
                } else {
                    obstacle.style.right = obstaclePos + 'px';
                }
                
                // Check for collisions - but only after player has some time to react
                if (score > 20) { // Wait for 2 seconds (20 score points) before enabling collisions
                    checkCollision();
                }
                
            }, 20);
        }
        
        // Jump function
        function jump() {
            if (isJumping) return;
            
            let position = 0;
            isJumping = true;
            
            dino.classList.remove('running');
            
            let jumpInterval = setInterval(function() {
                // Upward movement
                if (position < 150) { // Jump height
                    position += 12;
                    dino.style.bottom = (position + GROUND_HEIGHT) + 'px'; // Use constant for ground height
                } 
                // Downward movement
                else {
                    clearInterval(jumpInterval);
                    
                    let fallInterval = setInterval(function() {
                        if (position <= 0) {
                            clearInterval(fallInterval);
                            isJumping = false;
                            position = 0;
                            dino.style.bottom = GROUND_HEIGHT + 'px'; // Use constant for ground height
                            
                            // Add running animation back if game is still running
                            if (isGameRunning) {
                                dino.classList.add('running');
                            }
                        } else {
                            position -= 10;
                            position = position * gravity;
                            dino.style.bottom = (position + GROUND_HEIGHT) + 'px'; // Use constant for ground height
                        }
                    }, 20);
                }
            }, 20);
        }
        
        // Check for collisions with improved hit box detection
        function checkCollision() {
            // Get actual rendered position and dimensions
            const dinoRect = dino.getBoundingClientRect();
            const obstacleRect = obstacle.getBoundingClientRect();
            
            // Make hit box slightly smaller than visual element for better gameplay
            const hitBoxReduction = 8;
            
            // Create adjusted hitbox for dino
            const dinoHitBox = {
                left: dinoRect.left + hitBoxReduction,
                right: dinoRect.right - hitBoxReduction,
                top: dinoRect.top + hitBoxReduction,
                bottom: dinoRect.bottom - hitBoxReduction
            };
            
            // Check collision with obstacle with adjusted hitbox
            if (
                dinoHitBox.right > obstacleRect.left + hitBoxReduction &&
                dinoHitBox.left < obstacleRect.right - hitBoxReduction &&
                dinoHitBox.bottom > obstacleRect.top + hitBoxReduction
            ) {
                gameOver();
            }
        }
        
        // Handle touch for mobile devices
        gameContainer.addEventListener('touchstart', function() {
            if (!isGameRunning) {
                startGame();
            } else if (!isJumping) {
                jump();
            }
        });
        
        // Handle messages from the extension
        window.addEventListener('message', event => {
            const message = event.data;
            if (message.type === 'stopGame') {
                if (isGameRunning) {
                    // Stop game animation
                    isGameRunning = false;
                    clearInterval(obstacleInterval);
                    clearInterval(scoreInterval);
                    dino.classList.remove('running');
                    
                    // Show final score
                    finalScoreValue.textContent = 'Score: ' + score;
                    gameContainer.style.display = 'none';
                    finalScoreDisplay.style.display = 'block';
                    
                    // Update top score
                    if (score > topScore) {
                        topScore = score;
                        localStorage.setItem('dinoTopScore', topScore);
                    }
                }
            }
        });
        
        // Ensure proper initial positioning
        window.addEventListener('load', function() {
            // Set initial position of dinosaur
            dino.style.bottom = GROUND_HEIGHT + 'px';
            
            // Set initial position of obstacle (off-screen)
            obstacle.style.right = OBSTACLE_START_POSITION + 'px';
                        
            // Force layout calculation to prevent gap
            document.querySelector('.game-world').offsetHeight;
        });
        `;
    }
}