import { CopilotGame } from '../gameInterface';

/**
 * Modern Dino Runner game with polished UX and smooth animations
 */
export class DinoGame implements CopilotGame {
    id = 'robot-runner';
    name = 'Robot Runner';
    description = 'Jump over obstacles and survive as long as you can as a robot';
    
    getHtmlContent(): string {
        return `
        <div class="dino-container">
            <div class="dino-header">
                <div class="dino-title">Dino Runner</div>
                <div class="dino-subtitle">Jump to survive</div>
            </div>
            
            <div class="dino-stats">
                <div class="dino-stat">
                    <div class="dino-stat-label">Score</div>
                    <div class="dino-stat-value" id="dino-score">0</div>
                </div>
                <div class="dino-stat">
                    <div class="dino-stat-label">Speed</div>
                    <div class="dino-stat-value" id="dino-speed">1x</div>
                </div>
                <div class="dino-stat">
                    <div class="dino-stat-label">Best</div>
                    <div class="dino-stat-value" id="dino-best">0</div>
                </div>
            </div>
            
            <div class="dino-game-world" id="dino-game-world">
                <div class="dino-background">
                    <div class="dino-cloud" style="left: 10%; animation-delay: 0s;"></div>
                    <div class="dino-cloud" style="left: 30%; animation-delay: -5s;"></div>
                    <div class="dino-cloud" style="left: 60%; animation-delay: -10s;"></div>
                    <div class="dino-cloud" style="left: 80%; animation-delay: -15s;"></div>
                </div>
                
                <div class="dino-ground-line"></div>
                
                <div class="dino-player" id="dino-player">
                    <div class="dino-body">
                        <div class="dino-head">
                            <div class="dino-eye"></div>
                            <div class="dino-mouth"></div>
                        </div>
                        <div class="dino-torso"></div>
                        <div class="dino-legs">
                            <div class="dino-leg dino-leg-1"></div>
                            <div class="dino-leg dino-leg-2"></div>
                        </div>
                        <div class="dino-tail"></div>
                    </div>
                </div>
                
                <div class="dino-obstacles" id="dino-obstacles"></div>
                
                <div class="dino-overlay" id="dino-overlay">
                    <div class="dino-overlay-content">
                        <div class="dino-status" id="dino-status">Ready to run?</div>
                        <div class="dino-instructions">Press SPACE to jump or ↓ to duck</div>
                        <button class="dino-start-btn" id="dino-start">Start Game</button>
                    </div>
                </div>
            </div>
            
            <div class="dino-controls">
                <div class="dino-control-hint">
                    <div class="dino-key">SPACE</div>
                    <div class="dino-action">Jump</div>
                </div>
                <div class="dino-control-hint">
                    <div class="dino-key">↓</div>
                    <div class="dino-action">Duck</div>
                </div>
            </div>
        </div>
        `;
    }    getCssContent(): string {
        return `
        .dino-container {
            width: 100%;
            max-width: 700px;
            margin: 0 auto;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, rgba(30, 30, 30, 0.9), rgba(50, 50, 50, 0.9));
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
        }
        
        .dino-header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .dino-title {
            font-size: 32px;
            font-weight: 700;
            color: var(--vscode-foreground);
            margin-bottom: 8px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .dino-subtitle {
            font-size: 16px;
            color: var(--vscode-descriptionForeground);
            opacity: 0.8;
        }
        
        .dino-stats {
            display: flex;
            justify-content: space-around;
            margin-bottom: 25px;
            padding: 20px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 15px;
            backdrop-filter: blur(10px);
        }
        
        .dino-stat {
            text-align: center;
        }
        
        .dino-stat-label {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            margin-bottom: 5px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .dino-stat-value {
            font-size: 24px;
            font-weight: 700;
            color: var(--vscode-textLink-foreground);
        }
        
        .dino-game-world {
            position: relative;
            width: 100%;
            height: 300px;
            background: linear-gradient(180deg, #87CEEB 0%, #87CEEB 60%, #DEB887 60%, #D2B48C 100%);
            border-radius: 15px;
            overflow: hidden;
            margin-bottom: 25px;
            box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.1);
        }
        
        .dino-background {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
        }
        
        .dino-cloud {
            position: absolute;
            top: 20px;
            width: 60px;
            height: 20px;
            background: white;
            border-radius: 20px;
            opacity: 0.8;
            animation: dino-cloud-float 20s linear infinite;
        }
        
        .dino-cloud:before {
            content: '';
            position: absolute;
            top: -10px;
            left: 15px;
            width: 30px;
            height: 30px;
            background: white;
            border-radius: 50%;
        }
        
        .dino-cloud:after {
            content: '';
            position: absolute;
            top: -5px;
            right: 15px;
            width: 20px;
            height: 20px;
            background: white;
            border-radius: 50%;
        }
        
        @keyframes dino-cloud-float {
            0% { transform: translateX(-80px); }
            100% { transform: translateX(calc(100vw + 80px)); }
        }
          .dino-ground-line {
            position: absolute;
            bottom: 80px;
            left: 0;
            right: 0;
            height: 2px;
            background: rgba(0, 0, 0, 0.2);
        }
          .dino-player {
            position: absolute;
            bottom: 80px;
            left: 50px;
            width: 70px;
            height: 80px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 10;
        }
        
        .dino-player.jumping {
            bottom: 200px;
        }
        
        .dino-player.ducking {
            transform: scaleY(0.6);
            transform-origin: bottom;
        }
        
        .dino-player.running .dino-leg-1,
        .dino-player.running .dino-leg-2 {
            animation: dino-run 0.4s infinite;
        }
        
        .dino-player.running .dino-leg-2 {
            animation-delay: 0.2s;
        }
          .dino-body {
            position: relative;
            width: 100%;
            height: 100%;
        }        .dino-head {
            position: absolute;
            top: 0px;
            left: 25px;
            width: 20px;
            height: 20px;
            background: linear-gradient(135deg, #C0C0C0, #A9A9A9); /* Changed to silver */
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(33, 150, 243, 0.4);
        }
        
        .dino-head:before {
            content: '';
            position: absolute;
            top: 2px;
            left: 2px;
            width: 16px;
            height: 3px;
            background: linear-gradient(135deg, #42A5F5, #2196F3);
            border-radius: 1px;
        }
        
        .dino-eye {
            position: absolute;
            top: 6px;
            left: 4px;
            width: 4px;
            height: 4px;
            background: white;
            border-radius: 1px;
            box-shadow: inset 1px 1px 1px rgba(0, 0, 0, 0.2);
        }
        
        .dino-eye:after {
            content: '';
            position: absolute;
            top: 6px;
            left: 8px;
            width: 4px;
            height: 4px;
            background: white;
            border-radius: 1px;
            box-shadow: inset 1px 1px 1px rgba(0, 0, 0, 0.2);
        }
        
        .dino-mouth {
            position: absolute;
            top: 14px;
            left: 6px;
            width: 8px;
            height: 2px;
            background: #1976D2;
            border-radius: 1px;
        }
        
        .dino-torso {
            position: absolute;
            top: 18px;
            left: 20px;
            width: 30px;
            height: 40px;
            background: linear-gradient(135deg, #C0C0C0, #A9A9A9); /* Changed to silver */
            border-radius: 6px;
            box-shadow: 0 3px 10px rgba(33, 150, 243, 0.3);
        }
        
        .dino-torso:before {
            content: '';
            position: absolute;
            top: 6px;
            left: 6px;
            width: 18px;
            height: 20px;
            background: linear-gradient(135deg, #42A5F5, #2196F3);
            border-radius: 3px;
        }
        
        .dino-torso:after {
            content: '';
            position: absolute;
            top: 28px;
            left: 10px;
            width: 10px;
            height: 8px;
            background: #42A5F5;
            border-radius: 2px;
        }.dino-legs {
            position: absolute;
            bottom: 0;
            left: 25px;
            width: 20px;
            height: 22px;
        }
          .dino-leg {
            position: absolute;
            bottom: 0;
            width: 8px;
            height: 22px;
            background: linear-gradient(135deg, #C0C0C0, #A9A9A9); /* Changed to silver */
            border-radius: 2px;
            box-shadow: 0 2px 6px rgba(33, 150, 243, 0.3);
        }
        
        .dino-leg:before {
            content: '';
            position: absolute;
            bottom: -2px;
            left: -1px;
            width: 10px;
            height: 4px;
            background: linear-gradient(135deg, #1976D2, #1565C0);
            border-radius: 1px;
        }
        
        .dino-leg-1 {
            left: 2px;
        }
        
        .dino-leg-2 {
            right: 2px;
        }
        
        @keyframes dino-run {
            0%, 100% { transform: translateY(0) scaleY(1); }
            50% { transform: translateY(-5px) scaleY(0.9); }
        }
        
        .dino-tail {
            display: none;
        }
        
        .dino-obstacles {
            position: absolute;
            bottom: 80px;
            left: 0;
            right: 0;
            height: 30px;
        }
        
        .dino-obstacle {
            position: absolute;
            bottom: 0;
            width: 20px;
            height: 30px;
            background: #8B4513;
            border-radius: 2px;
            animation: dino-obstacle-move linear;
        }
        
        .dino-obstacle.cactus {
            background: #228B22; /* Changed to green */
        }
        
        .dino-obstacle.cactus:before {
            content: '';
            position: absolute;
            top: 5px;
            left: -5px;
            width: 8px;
            height: 15px;
            background: #8B4513;
            border-radius: 2px;
        }
        
        .dino-obstacle.cactus:after {
            content: '';
            position: absolute;
            top: 5px;
            right: -5px;
            width: 8px;
            height: 15px;
            background: #8B4513;
            border-radius: 2px;
        }        .dino-obstacle.bird {
            width: 30px;
            height: 15px;
            background: #FF0000; /* Changed to red */
            border-radius: 50%;
            bottom: 90px; /* Further adjusted to align with robot's head */
        }
        
        .dino-obstacle.bird:before {
            content: '';
            position: absolute;
            top: -3px;
            left: 5px;
            width: 8px;
            height: 8px;
            background: #654321;
            border-radius: 50% 50% 0 50%;
            animation: bird-flap 0.2s infinite;
        }
        
        .dino-obstacle.bird:after {
            content: '';
            position: absolute;
            top: -3px;
            right: 5px;
            width: 8px;
            height: 8px;
            background: #654321;
            border-radius: 50% 50% 50% 0;
            animation: bird-flap 0.2s infinite reverse;
        }
        
        @keyframes bird-flap {
            0%, 100% { transform: rotateX(0deg); }
            50% { transform: rotateX(60deg); }
        }
        
        @keyframes dino-obstacle-move {
            0% { left: 100%; }
            100% { left: -50px; }
        }
        
        .dino-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            display: flex;
            justify-content: center;
            align-items: center;
            transition: all 0.3s ease;
            z-index: 20;
        }
        
        .dino-overlay.hidden {
            opacity: 0;
            pointer-events: none;
            visibility: hidden;
        }
        
        .dino-overlay-content {
            text-align: center;
            padding: 30px;
        }
        
        .dino-status {
            font-size: 24px;
            font-weight: 600;
            color: white;
            margin-bottom: 10px;
        }
        
        .dino-instructions {
            font-size: 16px;
            color: rgba(255, 255, 255, 0.8);
            margin-bottom: 20px;
        }
        
        .dino-start-btn {
            background: linear-gradient(145deg, var(--vscode-button-background), var(--vscode-button-hoverBackground));
            color: var(--vscode-button-foreground);
            border: none;
            padding: 12px 32px;
            border-radius: 25px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            min-width: 140px;
        }
        
        .dino-start-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        }
        
        .dino-start-btn:active {
            transform: translateY(0);
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }
        
        .dino-controls {
            display: flex;
            justify-content: center;
            gap: 30px;
        }
        
        .dino-control-hint {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 15px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            backdrop-filter: blur(10px);
        }
        
        .dino-key {
            padding: 5px 10px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 5px;
            font-family: monospace;
            font-weight: 600;
            color: var(--vscode-foreground);
        }
        
        .dino-action {
            font-size: 14px;
            color: var(--vscode-descriptionForeground);
        }
        
        @media (max-width: 700px) {
            .dino-container {
                margin: 10px;
                padding: 15px;
            }
            
            .dino-stats {
                flex-direction: column;
                gap: 15px;
            }
            
            .dino-stat {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .dino-stat-label {
                margin-bottom: 0;
            }
            
            .dino-controls {
                flex-direction: column;
                gap: 10px;
            }
        }
        `;
    }    
    getJavaScriptContent(): string {
        return `
        class DinoGameLogic {
            constructor() {
                this.gameWorld = document.getElementById('dino-game-world');
                this.player = document.getElementById('dino-player');
                this.obstacles = document.getElementById('dino-obstacles');
                this.overlay = document.getElementById('dino-overlay');
                this.startBtn = document.getElementById('dino-start');
                this.status = document.getElementById('dino-status');
                this.scoreEl = document.getElementById('dino-score');
                this.speedEl = document.getElementById('dino-speed');
                this.bestEl = document.getElementById('dino-best');
                
                this.isRunning = false;
                this.isJumping = false;
                this.isDucking = false;
                this.score = 0;
                this.speed = 1;
                this.gameSpeed = 3;
                this.obstacleTimer = 0;
                this.obstacleDelay = 2000;
                this.activeObstacles = [];
                this.animationId = null;
                
                this.keys = {
                    space: false,
                    down: false
                };
                
                this.loadBestScore();
                this.bindEvents();
            }
            
            bindEvents() {
                this.startBtn.addEventListener('click', () => this.startGame());
                
                document.addEventListener('keydown', (e) => {
                    if (e.code === 'Space') {
                        e.preventDefault();
                        this.keys.space = true;
                        if (!this.isRunning) {
                            this.startGame();
                        } else if (!this.isJumping) {
                            this.jump();
                        }
                    } else if (e.code === 'ArrowDown') {
                        e.preventDefault();
                        this.keys.down = true;
                        if (this.isRunning && !this.isJumping) {
                            this.duck();
                        }
                    }
                });
                
                document.addEventListener('keyup', (e) => {
                    if (e.code === 'Space') {
                        this.keys.space = false;
                    } else if (e.code === 'ArrowDown') {
                        this.keys.down = false;
                        if (this.isDucking) {
                            this.stopDucking();
                        }
                    }
                });
                
                // Touch support
                this.gameWorld.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    if (!this.isRunning) {
                        this.startGame();
                    } else if (!this.isJumping) {
                        this.jump();
                    }
                });
            }
            
            startGame() {
                if (this.isRunning) return;
                
                this.isRunning = true;
                this.score = 0;
                this.speed = 1;
                this.gameSpeed = 3;
                this.obstacleTimer = 0;
                this.obstacleDelay = 2000;
                this.activeObstacles = [];
                
                this.hideOverlay();
                this.player.classList.add('running');
                this.updateScore();
                this.updateSpeed();
                
                // Clear any existing obstacles
                this.obstacles.innerHTML = '';
                
                this.gameLoop();
            }
            
            gameLoop() {
                if (!this.isRunning) return;
                
                this.obstacleTimer += 16;
                
                // Spawn obstacles
                if (this.obstacleTimer >= this.obstacleDelay) {
                    this.spawnObstacle();
                    this.obstacleTimer = 0;
                    // Decrease delay as game progresses (increase difficulty)
                    this.obstacleDelay = Math.max(800, this.obstacleDelay - 5);
                }
                
                // Update obstacles
                this.updateObstacles();
                
                // Update score and speed
                this.score += 1;
                if (this.score % 500 === 0) {
                    this.speed += 0.1;
                    this.gameSpeed += 0.5;
                }
                this.updateScore();
                this.updateSpeed();
                
                // Check collisions
                this.checkCollisions();
                
                this.animationId = requestAnimationFrame(() => this.gameLoop());
            }
            
            spawnObstacle() {
                const obstacle = document.createElement('div');
                obstacle.className = 'dino-obstacle';
                
                // Random obstacle type
                const types = ['cactus', 'bird'];
                const type = types[Math.floor(Math.random() * types.length)];
                obstacle.classList.add(type);                
                if (type === 'bird') {
                    obstacle.style.bottom = '60px'; // Adjusted to align with robot's head while standing
                }
                
                obstacle.style.left = '100%';
                obstacle.style.animationDuration = (4 / this.gameSpeed) + 's';
                
                this.obstacles.appendChild(obstacle);
                this.activeObstacles.push(obstacle);
            }
            
            updateObstacles() {
                this.activeObstacles = this.activeObstacles.filter(obstacle => {
                    const rect = obstacle.getBoundingClientRect();
                    if (rect.right < 0) {
                        obstacle.remove();
                        return false;
                    }
                    return true;
                });
            }
            
            jump() {
                if (this.isJumping || this.isDucking) return;
                
                this.isJumping = true;
                this.player.classList.remove('running');
                this.player.classList.add('jumping');
                  setTimeout(() => {
                    if (this.isRunning) {
                        this.player.classList.remove('jumping');
                        this.player.classList.add('running');
                    }
                    this.isJumping = false;
                }, 400);
            }
            
            duck() {
                if (this.isJumping || this.isDucking) return;
                
                this.isDucking = true;
                this.player.classList.remove('running');
                this.player.classList.add('ducking');
            }
            
            stopDucking() {
                if (!this.isDucking) return;
                
                this.isDucking = false;
                this.player.classList.remove('ducking');
                if (this.isRunning) {
                    this.player.classList.add('running');
                }
            }
              checkCollisions() {
                const playerRect = this.player.getBoundingClientRect();
                
                for (const obstacle of this.activeObstacles) {
                    const obstacleRect = obstacle.getBoundingClientRect();
                    
                    // Simple collision detection with smaller hitboxes for better gameplay
                    const margin = 8;
                    if (
                        playerRect.left + margin < obstacleRect.right - margin &&
                        playerRect.right - margin > obstacleRect.left + margin &&
                        playerRect.top + margin < obstacleRect.bottom - margin &&
                        playerRect.bottom - margin > obstacleRect.top + margin
                    ) {
                        // Immediate freeze - stop all animations and movement
                        this.freezeGame();
                        this.gameOver();
                        return;
                    }
                }
            }
            
            freezeGame() {
                // Stop the game loop immediately
                if (this.animationId) {
                    cancelAnimationFrame(this.animationId);
                    this.animationId = null;
                }
                
                // Stop all obstacle animations by pausing them
                this.activeObstacles.forEach(obstacle => {
                    obstacle.style.animationPlayState = 'paused';
                });
                
                // Stop player animations
                this.player.classList.remove('running');
                
                // Add collision effect
                this.player.style.filter = 'brightness(0.5) contrast(1.5)';
                this.gameWorld.style.filter = 'grayscale(0.3)';
            }
              gameOver() {
                this.isRunning = false;
                
                this.player.classList.remove('running', 'jumping', 'ducking');
                
                // Update best score
                const currentBest = parseInt(localStorage.getItem('dino-best-score') || '0');
                if (this.score > currentBest) {
                    localStorage.setItem('dino-best-score', this.score.toString());
                    this.loadBestScore();
                }
                
                // Show game over after a brief pause to show the collision
                setTimeout(() => {
                    // Reset visual effects
                    this.player.style.filter = '';
                    this.gameWorld.style.filter = '';
                    
                    // Show game over overlay
                    this.status.textContent = \`Game Over! Score: \${Math.floor(this.score / 10)}\`;
                    this.startBtn.textContent = 'Play Again';
                    this.showOverlay();
                    
                    // Clear obstacles
                    this.obstacles.innerHTML = '';
                    this.activeObstacles = [];
                }, 800);
            }
            
            updateScore() {
                this.scoreEl.textContent = Math.floor(this.score / 10);
            }
            
            updateSpeed() {
                this.speedEl.textContent = this.speed.toFixed(1) + 'x';
            }
            
            loadBestScore() {
                const best = parseInt(localStorage.getItem('dino-best-score') || '0');
                this.bestEl.textContent = best;
            }
            
            showOverlay() {
                this.overlay.classList.remove('hidden');
            }
            
            hideOverlay() {
                this.overlay.classList.add('hidden');
            }
        }
        
        // Initialize the game
        let dinoGame;
        
        function initDinoGame() {
            dinoGame = new DinoGameLogic();
        }
        
        // Start when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initDinoGame);
        } else {
            initDinoGame();
        }
        `;
    }
}