import { CopilotGame } from '../gameInterface';

/**
 * Modern Breakout game with polished UX and smooth animations
 */
export class BreakoutGame implements CopilotGame {
    id = 'breakout-blaster';
    name = 'Breakout Blaster';
    description = 'Destroy all bricks with your energy ball and power-ups';
    
    getHtmlContent(): string {
        return `
        <div class="breakout-container">
            <div class="breakout-header">
                <div class="breakout-title">Breakout Blaster</div>
                <div class="breakout-subtitle">Destroy all bricks to win</div>
            </div>
              <div class="breakout-stats">
                <div class="breakout-stat">
                    <div class="breakout-stat-label">Score</div>
                    <div class="breakout-stat-value" id="breakout-score">0</div>
                </div>
                <div class="breakout-stat">
                    <div class="breakout-stat-label">Level</div>
                    <div class="breakout-stat-value" id="breakout-level">1</div>
                </div>
                <div class="breakout-stat">
                    <div class="breakout-stat-label">Best</div>
                    <div class="breakout-stat-value" id="breakout-best">0</div>
                </div>
            </div><div class="breakout-game-world" id="breakout-game-world">
                <div class="breakout-canvas-container">
                    <canvas id="breakout-canvas" width="600" height="400"></canvas>
                    <div class="breakout-particles" id="breakout-particles"></div>
                    <div class="breakout-overlay" id="breakout-overlay">
                        <div class="breakout-overlay-content">
                            <div class="breakout-message" id="breakout-message">Ready to blast some bricks?</div>
                            <div class="breakout-sub-message" id="breakout-sub-message">Click Start Game to begin</div>
                        </div>
                    </div>
                </div>
                
                <div class="breakout-power-ups" id="breakout-power-ups">
                    <div class="breakout-power-up-item" id="multiball-status">
                        <div class="breakout-power-icon">⚡</div>
                        <div class="breakout-power-label">Multi-Ball</div>
                    </div>
                    <div class="breakout-power-up-item" id="laser-status">
                        <div class="breakout-power-icon">🔆</div>
                        <div class="breakout-power-label">Laser</div>
                    </div>
                    <div class="breakout-power-up-item" id="bigpaddle-status">
                        <div class="breakout-power-icon">📏</div>
                        <div class="breakout-power-label">Big Paddle</div>
                    </div>                </div>
            </div>
            
            <div class="breakout-controls">
                <div class="breakout-instructions">
                    <div class="breakout-instruction">🖱️ Move mouse to control paddle</div>
                    <div class="breakout-instruction">📍 Click to launch ball</div>
                    <div class="breakout-instruction">🎯 Destroy all bricks to advance</div>
                </div>
                  <div class="breakout-actions">
                    <button class="breakout-btn breakout-start-btn" id="breakout-start">Start Game</button>
                    <button class="breakout-btn breakout-pause-btn" id="breakout-pause" style="display: none;">Pause</button>
                    <button class="breakout-btn breakout-reset-btn" id="breakout-reset">Reset</button>
                </div>
                
                <div class="breakout-lives-indicator">
                    <div class="breakout-lives-label">Lives:</div>
                    <div class="breakout-lives-display" id="breakout-lives-display">
                        <span class="breakout-life active">♥</span>
                        <span class="breakout-life active">♥</span>
                        <span class="breakout-life active">♥</span>
                    </div>
                </div>
            </div>
        </div>
        `;
    }
    
    getCssContent(): string {
        return `        .breakout-container {
            width: 100%;
            max-width: 700px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, rgba(30, 30, 30, 0.9), rgba(50, 50, 50, 0.9));
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            color: var(--vscode-foreground);
            position: relative;
            overflow: hidden;
            backdrop-filter: blur(10px);
        }
        
        .breakout-container::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle at center, rgba(0, 255, 255, 0.03) 0%, transparent 50%);
            animation: breakout-pulse 4s ease-in-out infinite;
            pointer-events: none;
        }
        
        @keyframes breakout-pulse {
            0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.3; }
            50% { transform: scale(1.1) rotate(180deg); opacity: 0.1; }
        }
        
        .breakout-header {
            text-align: center;
            margin-bottom: 20px;
            position: relative;
            z-index: 2;
        }
          .breakout-title {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 5px;
            background: linear-gradient(45deg, #00ffff, #ff00ff, #ffff00);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-shadow: 0 0 30px rgba(0, 255, 255, 0.5);
            animation: breakout-glow 2s ease-in-out infinite alternate;
        }
        
        @keyframes breakout-glow {
            from { filter: brightness(1) drop-shadow(0 0 5px rgba(0, 255, 255, 0.5)); }
            to { filter: brightness(1.2) drop-shadow(0 0 15px rgba(0, 255, 255, 0.8)); }
        }
          .breakout-subtitle {
            font-size: 1rem;
            color: var(--vscode-descriptionForeground);
            margin-bottom: 10px;
            opacity: 0.8;
        }
          .breakout-stats {
            display: flex;
            justify-content: space-around;
            margin-bottom: 20px;
            padding: 20px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 15px;
            border: 1px solid rgba(0, 255, 255, 0.2);
            position: relative;
            z-index: 2;
            backdrop-filter: blur(10px);
        }
        
        .breakout-stat {
            text-align: center;
            flex: 1;
        }
        
        .breakout-stat-label {
            font-size: 0.8rem;
            color: var(--vscode-descriptionForeground);
            margin-bottom: 5px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            opacity: 0.8;
        }
        
        .breakout-stat-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: #00ffff;
            text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
        }
        
        .breakout-game-world {
            position: relative;
            margin-bottom: 20px;
            z-index: 2;
        }
          .breakout-canvas-container {
            position: relative;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 15px;
            border: 2px solid rgba(0, 255, 255, 0.3);
            overflow: hidden;
            box-shadow: inset 0 0 50px rgba(0, 255, 255, 0.1);
        }
          #breakout-canvas {
            display: block;
            width: 100%;
            height: auto;
            max-width: 600px;
            background: linear-gradient(135deg, rgba(0, 10, 20, 0.8), rgba(10, 0, 20, 0.8));
        }
        
        .breakout-particles {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            overflow: hidden;
        }
        
        .breakout-particle {
            position: absolute;
            width: 4px;
            height: 4px;
            background: radial-gradient(circle, #00ffff, transparent);
            border-radius: 50%;
            animation: breakout-particle-float 1s ease-out forwards;
        }
        
        @keyframes breakout-particle-float {
            0% {
                opacity: 1;
                transform: scale(1);
            }
            100% {
                opacity: 0;
                transform: scale(0) translate(var(--dx), var(--dy));
            }
        }
        
        .breakout-power-ups {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin-top: 15px;
            padding: 10px;
        }
        
        .breakout-power-up-item {
            display: flex;
            align-items: center;
            gap: 5px;
            padding: 8px 12px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            opacity: 0.4;
            transition: all 0.3s ease;
        }
        
        .breakout-power-up-item.active {
            opacity: 1;
            background: rgba(0, 255, 255, 0.1);
            border-color: rgba(0, 255, 255, 0.3);
            box-shadow: 0 0 15px rgba(0, 255, 255, 0.2);
        }
        
        .breakout-power-icon {
            font-size: 1.2rem;
        }
          .breakout-power-label {
            font-size: 0.8rem;
            color: var(--vscode-descriptionForeground);
            opacity: 0.8;
        }
        
        .breakout-controls {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 20px;
            position: relative;
            z-index: 2;
        }
        
        .breakout-instructions {
            flex: 1;
        }
          .breakout-instruction {
            font-size: 0.9rem;
            color: var(--vscode-descriptionForeground);
            margin-bottom: 5px;
            display: flex;
            align-items: center;
            gap: 8px;
            opacity: 0.8;
        }
        
        .breakout-actions {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        
        .breakout-btn {
            padding: 12px 24px;
            border: none;
            border-radius: 25px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            position: relative;
            overflow: hidden;
        }
        
        .breakout-btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s ease;
        }
        
        .breakout-btn:hover::before {
            left: 100%;
        }
        
        .breakout-start-btn {
            background: linear-gradient(45deg, #00ff88, #00ffff);
            color: #000;
            box-shadow: 0 5px 15px rgba(0, 255, 136, 0.3);
        }
        
        .breakout-start-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(0, 255, 136, 0.4);
        }
        
        .breakout-pause-btn {
            background: linear-gradient(45deg, #ffaa00, #ff6600);
            color: #fff;
            box-shadow: 0 5px 15px rgba(255, 170, 0, 0.3);
        }
        
        .breakout-pause-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(255, 170, 0, 0.4);
        }
        
        .breakout-reset-btn {
            background: linear-gradient(45deg, #ff4444, #ff0066);
            color: #fff;
            box-shadow: 0 5px 15px rgba(255, 68, 68, 0.3);
        }
        
        .breakout-reset-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(255, 68, 68, 0.4);
        }
        
        .breakout-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 20px;
            z-index: 10;
            transition: opacity 0.3s ease;
        }
        
        .breakout-overlay.hidden {
            opacity: 0;
            pointer-events: none;
        }
        
        .breakout-overlay-content {
            text-align: center;
            padding: 40px;
            background: rgba(20, 20, 40, 0.9);
            border-radius: 20px;
            border: 2px solid rgba(0, 255, 255, 0.3);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
        }
        
        .breakout-message {
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 10px;
            color: #00ffff;
            text-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
        }
        
        .breakout-sub-message {
            font-size: 1.1rem;
            color: rgba(255, 255, 255, 0.8);
        }
        
        .breakout-lives-indicator {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            margin-top: 15px;
            padding: 10px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
        }
        
        .breakout-lives-label {
            font-size: 0.9rem;
            color: var(--vscode-descriptionForeground);
            font-weight: 600;
        }
        
        .breakout-lives-display {
            display: flex;
            gap: 5px;
        }
        
        .breakout-life {
            font-size: 1.2rem;
            transition: all 0.3s ease;
        }
        
        .breakout-life.active {
            color: #ff4444;
            text-shadow: 0 0 10px rgba(255, 68, 68, 0.5);
        }
        
        .breakout-life:not(.active) {
            color: rgba(255, 255, 255, 0.2);
            text-shadow: none;
        }        @media (max-width: 700px) {
            .breakout-container {
                padding: 15px;
            }
            
            .breakout-title {
                font-size: 1.8rem;
            }
            
            .breakout-stats {
                flex-wrap: wrap;
                gap: 10px;
            }
            
            .breakout-stat {
                min-width: 80px;
            }
            
            .breakout-controls {
                flex-direction: column;
                gap: 15px;
            }
            
            .breakout-actions {
                justify-content: center;
            }
            
            .breakout-power-ups {
                flex-wrap: wrap;
            }
        }
        `;
    }
    
    getJavaScriptContent(): string {
        return `
        class BreakoutGame {
            constructor() {
                this.canvas = document.getElementById('breakout-canvas');
                this.ctx = this.canvas.getContext('2d');
                this.particlesContainer = document.getElementById('breakout-particles');
                
                // Game state
                this.gameState = 'menu'; // menu, playing, paused, gameover, levelcomplete
                this.score = 0;
                this.level = 1;
                this.lives = 3;
                this.bestScore = parseInt(localStorage.getItem('breakout-best-score') || '0');
                
                // Game objects
                this.paddle = null;
                this.balls = [];
                this.bricks = [];
                this.powerUps = [];
                this.lasers = [];
                
                // Power-up states
                this.powerUpStates = {
                    multiball: { active: false, timer: 0 },
                    laser: { active: false, timer: 0 },
                    bigpaddle: { active: false, timer: 0 }
                };
                
                // Animation
                this.animationId = null;
                this.lastTime = 0;
                
                this.setupCanvas();
                this.setupEventListeners();
                this.updateDisplay();
                this.showOverlay('Ready to blast some bricks?', 'Click Start Game to begin');
            }
              setupCanvas() {
                const rect = this.canvas.getBoundingClientRect();
                this.canvas.width = 600;
                this.canvas.height = 400;
                
                // Set up responsive canvas
                const resizeCanvas = () => {
                    const container = this.canvas.parentElement;
                    const maxWidth = container.clientWidth;
                    const scale = Math.min(1, maxWidth / 600);
                    this.canvas.style.width = (600 * scale) + 'px';
                    this.canvas.style.height = (400 * scale) + 'px';
                };
                
                resizeCanvas();
                window.addEventListener('resize', resizeCanvas);
            }
            
            setupEventListeners() {                // Mouse movement for paddle
                this.canvas.addEventListener('mousemove', (e) => {
                    if (this.gameState === 'playing' && this.paddle) {
                        const rect = this.canvas.getBoundingClientRect();
                        const scaleX = this.canvas.width / rect.width;
                        const mouseX = (e.clientX - rect.left) * scaleX;
                        this.paddle.x = Math.max(this.paddle.width / 2, 
                            Math.min(this.canvas.width - this.paddle.width / 2, mouseX));
                    }
                });
                
                // Click to launch ball
                this.canvas.addEventListener('click', () => {
                    if (this.gameState === 'playing') {
                        this.balls.forEach(ball => {
                            if (ball.stuck) {
                                ball.stuck = false;
                                ball.vx = (Math.random() - 0.5) * 4;
                                ball.vy = -6;
                            }
                        });
                        
                        // Laser shooting
                        if (this.powerUpStates.laser.active) {
                            this.shootLaser();
                        }
                    }
                });
                
                // Button events
                document.getElementById('breakout-start').addEventListener('click', () => this.startGame());
                document.getElementById('breakout-pause').addEventListener('click', () => this.togglePause());
                document.getElementById('breakout-reset').addEventListener('click', () => this.resetGame());
            }
            
            startGame() {
                this.gameState = 'playing';
                this.resetLevel();
                this.hideOverlay();
                this.updateButtonVisibility();
                this.gameLoop();
            }
            
            resetGame() {
                this.gameState = 'menu';
                this.score = 0;
                this.level = 1;
                this.lives = 3;
                this.powerUpStates = {
                    multiball: { active: false, timer: 0 },
                    laser: { active: false, timer: 0 },
                    bigpaddle: { active: false, timer: 0 }
                };
                
                if (this.animationId) {
                    cancelAnimationFrame(this.animationId);
                    this.animationId = null;
                }
                
                this.updateDisplay();
                this.updatePowerUpDisplay();
                this.updateButtonVisibility();
                this.showOverlay('Ready to blast some bricks?', 'Click Start Game to begin');
            }
            
            togglePause() {
                if (this.gameState === 'playing') {
                    this.gameState = 'paused';
                    this.showOverlay('Game Paused', 'Click to resume');
                } else if (this.gameState === 'paused') {
                    this.gameState = 'playing';
                    this.hideOverlay();
                    this.gameLoop();
                }
                this.updateButtonVisibility();
            }
              resetLevel() {
                // Create paddle
                this.paddle = {
                    x: this.canvas.width / 2,
                    y: this.canvas.height - 40,
                    width: this.powerUpStates.bigpaddle.active ? 120 : 80,
                    height: 12,
                    color: '#00ffff'
                };
                
                // Create ball
                this.balls = [{
                    x: this.paddle.x,
                    y: this.paddle.y - 20,
                    radius: 8,
                    vx: 0,
                    vy: 0,
                    stuck: true,
                    color: '#ffff00',
                    trail: []
                }];
                
                // Create bricks
                this.createBricks();
                
                // Clear power-ups and lasers
                this.powerUps = [];
                this.lasers = [];
            }
              createBricks() {
                this.bricks = [];
                const rows = Math.min(5 + Math.floor(this.level / 3), 8);
                const cols = 8;
                const brickWidth = 65;
                const brickHeight = 20;
                const padding = 4;
                const offsetX = (this.canvas.width - (cols * (brickWidth + padding) - padding)) / 2;
                const offsetY = 60;
                
                const colors = ['#ff0066', '#ff6600', '#ffaa00', '#00ff88', '#00ffff', '#6600ff', '#ff00ff'];
                
                for (let row = 0; row < rows; row++) {
                    for (let col = 0; col < cols; col++) {
                        const brick = {
                            x: offsetX + col * (brickWidth + padding),
                            y: offsetY + row * (brickHeight + padding),
                            width: brickWidth,
                            height: brickHeight,
                            color: colors[row % colors.length],
                            hits: Math.floor(this.level / 3) + 1,
                            maxHits: Math.floor(this.level / 3) + 1,
                            points: (row + 1) * 10 * this.level
                        };
                        this.bricks.push(brick);
                    }
                }
            }
            
            gameLoop(currentTime = 0) {
                if (this.gameState !== 'playing') return;
                
                const deltaTime = currentTime - this.lastTime;
                this.lastTime = currentTime;
                
                this.update(deltaTime);
                this.render();
                
                this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
            }
            
            update(deltaTime) {
                // Update power-up timers
                Object.keys(this.powerUpStates).forEach(key => {
                    const powerUp = this.powerUpStates[key];
                    if (powerUp.active) {
                        powerUp.timer -= deltaTime;
                        if (powerUp.timer <= 0) {
                            powerUp.active = false;
                            if (key === 'bigpaddle') {
                                this.paddle.width = 80;
                            }
                        }
                    }
                });
                
                // Update paddle size if big paddle is active
                if (this.powerUpStates.bigpaddle.active) {
                    this.paddle.width = 120;
                }
                
                // Update balls
                this.balls.forEach((ball, ballIndex) => {
                    if (!ball.stuck) {
                        // Add to trail
                        ball.trail.push({ x: ball.x, y: ball.y });
                        if (ball.trail.length > 8) ball.trail.shift();
                        
                        // Move ball
                        ball.x += ball.vx;
                        ball.y += ball.vy;
                        
                        // Ball collision with walls
                        if (ball.x - ball.radius <= 0 || ball.x + ball.radius >= this.canvas.width) {
                            ball.vx = -ball.vx;
                            ball.x = Math.max(ball.radius, Math.min(this.canvas.width - ball.radius, ball.x));
                            this.createParticles(ball.x, ball.y, '#00ffff');
                        }
                        
                        if (ball.y - ball.radius <= 0) {
                            ball.vy = -ball.vy;
                            ball.y = ball.radius;
                            this.createParticles(ball.x, ball.y, '#00ffff');
                        }
                        
                        // Ball collision with paddle
                        if (this.checkBallPaddleCollision(ball, this.paddle)) {
                            const relativeIntersectX = (ball.x - this.paddle.x) / (this.paddle.width / 2);
                            const normalizedRelativeIntersectionX = Math.max(-1, Math.min(1, relativeIntersectX));
                            const bounceAngle = normalizedRelativeIntersectionX * Math.PI / 3;
                            
                            const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
                            ball.vx = speed * Math.sin(bounceAngle);
                            ball.vy = -Math.abs(speed * Math.cos(bounceAngle));
                            
                            ball.y = this.paddle.y - ball.radius;
                            this.createParticles(ball.x, ball.y, '#ffff00');
                        }
                        
                        // Ball collision with bricks
                        this.bricks.forEach((brick, brickIndex) => {
                            if (this.checkBallBrickCollision(ball, brick)) {
                                // Determine collision side
                                const ballCenterX = ball.x;
                                const ballCenterY = ball.y;
                                const brickCenterX = brick.x + brick.width / 2;
                                const brickCenterY = brick.y + brick.height / 2;
                                
                                const deltaX = ballCenterX - brickCenterX;
                                const deltaY = ballCenterY - brickCenterY;
                                
                                if (Math.abs(deltaX / brick.width) > Math.abs(deltaY / brick.height)) {
                                    ball.vx = -ball.vx;
                                } else {
                                    ball.vy = -ball.vy;
                                }
                                
                                // Damage brick
                                brick.hits--;
                                this.score += brick.points;
                                
                                this.createParticles(
                                    brick.x + brick.width / 2,
                                    brick.y + brick.height / 2,
                                    brick.color,
                                    15
                                );
                                
                                if (brick.hits <= 0) {
                                    this.bricks.splice(brickIndex, 1);
                                    
                                    // Chance to drop power-up
                                    if (Math.random() < 0.15) {
                                        this.createPowerUp(brick.x + brick.width / 2, brick.y + brick.height / 2);
                                    }
                                }
                            }
                        });
                        
                        // Ball falls off screen
                        if (ball.y > this.canvas.height) {
                            this.balls.splice(ballIndex, 1);
                        }
                    } else {
                        // Ball stuck to paddle
                        ball.x = this.paddle.x;
                        ball.y = this.paddle.y - 20;
                    }
                });
                
                // Update power-ups
                this.powerUps.forEach((powerUp, index) => {
                    powerUp.y += 2;
                    powerUp.rotation += 0.1;
                    
                    // Check collision with paddle
                    if (this.checkPowerUpPaddleCollision(powerUp, this.paddle)) {
                        this.activatePowerUp(powerUp.type);
                        this.powerUps.splice(index, 1);
                        this.createParticles(powerUp.x, powerUp.y, '#00ff88', 10);
                    }
                    
                    // Remove if off screen
                    if (powerUp.y > this.canvas.height) {
                        this.powerUps.splice(index, 1);
                    }
                });
                
                // Update lasers
                this.lasers.forEach((laser, index) => {
                    laser.y -= 8;
                    
                    // Check collision with bricks
                    this.bricks.forEach((brick, brickIndex) => {
                        if (laser.x >= brick.x && laser.x <= brick.x + brick.width &&
                            laser.y >= brick.y && laser.y <= brick.y + brick.height) {
                            
                            brick.hits--;
                            this.score += brick.points;
                            
                            this.createParticles(
                                brick.x + brick.width / 2,
                                brick.y + brick.height / 2,
                                brick.color,
                                10
                            );
                            
                            if (brick.hits <= 0) {
                                this.bricks.splice(brickIndex, 1);
                            }
                            
                            this.lasers.splice(index, 1);
                        }
                    });
                    
                    // Remove if off screen
                    if (laser.y < 0) {
                        this.lasers.splice(index, 1);
                    }
                });
                
                // Check game state
                if (this.balls.length === 0) {
                    this.lives--;
                    if (this.lives <= 0) {
                        this.gameOver();
                    } else {
                        // Reset ball
                        this.balls.push({
                            x: this.paddle.x,
                            y: this.paddle.y - 20,
                            radius: 8,
                            vx: 0,
                            vy: 0,
                            stuck: true,
                            color: '#ffff00',
                            trail: []
                        });
                    }
                }
                
                if (this.bricks.length === 0) {
                    this.levelComplete();
                }
                
                this.updateDisplay();
                this.updatePowerUpDisplay();
            }
            
            render() {
                // Clear canvas
                this.ctx.fillStyle = 'rgba(0, 5, 10, 0.1)';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                
                // Draw background grid
                this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)';
                this.ctx.lineWidth = 1;
                for (let x = 0; x < this.canvas.width; x += 40) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(x, 0);
                    this.ctx.lineTo(x, this.canvas.height);
                    this.ctx.stroke();
                }
                for (let y = 0; y < this.canvas.height; y += 40) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(0, y);
                    this.ctx.lineTo(this.canvas.width, y);
                    this.ctx.stroke();
                }
                
                // Draw bricks
                this.bricks.forEach(brick => {
                    const intensity = brick.hits / brick.maxHits;
                    this.ctx.fillStyle = brick.color;
                    this.ctx.shadowColor = brick.color;
                    this.ctx.shadowBlur = 10 * intensity;
                    this.ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
                    
                    // Brick border
                    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
                    
                    // Hit indicator
                    if (brick.hits < brick.maxHits) {
                        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                        this.ctx.fillRect(brick.x, brick.y, brick.width * (1 - intensity), brick.height);
                    }
                });
                
                // Draw paddle
                this.ctx.shadowColor = this.paddle.color;
                this.ctx.shadowBlur = 20;
                this.ctx.fillStyle = this.paddle.color;
                this.ctx.fillRect(
                    this.paddle.x - this.paddle.width / 2,
                    this.paddle.y,
                    this.paddle.width,
                    this.paddle.height
                );
                
                // Draw balls
                this.balls.forEach(ball => {
                    // Draw trail
                    ball.trail.forEach((point, index) => {
                        const alpha = index / ball.trail.length * 0.5;
                        this.ctx.fillStyle = \`rgba(255, 255, 0, \${alpha})\`;
                        this.ctx.beginPath();
                        this.ctx.arc(point.x, point.y, ball.radius * 0.5, 0, Math.PI * 2);
                        this.ctx.fill();
                    });
                    
                    // Draw ball
                    this.ctx.shadowColor = ball.color;
                    this.ctx.shadowBlur = 15;
                    this.ctx.fillStyle = ball.color;
                    this.ctx.beginPath();
                    this.ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    // Ball highlight
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    this.ctx.beginPath();
                    this.ctx.arc(ball.x - ball.radius * 0.3, ball.y - ball.radius * 0.3, ball.radius * 0.3, 0, Math.PI * 2);
                    this.ctx.fill();
                });
                
                // Draw power-ups
                this.powerUps.forEach(powerUp => {
                    this.ctx.save();
                    this.ctx.translate(powerUp.x, powerUp.y);
                    this.ctx.rotate(powerUp.rotation);
                    
                    this.ctx.shadowColor = powerUp.color;
                    this.ctx.shadowBlur = 10;
                    this.ctx.fillStyle = powerUp.color;
                    this.ctx.fillRect(-10, -10, 20, 20);
                    
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.font = '12px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText(powerUp.symbol, 0, 4);
                    
                    this.ctx.restore();
                });
                
                // Draw lasers
                this.lasers.forEach(laser => {
                    this.ctx.shadowColor = '#ff0066';
                    this.ctx.shadowBlur = 5;
                    this.ctx.fillStyle = '#ff0066';
                    this.ctx.fillRect(laser.x - 1, laser.y, 2, 10);
                });
                
                // Reset shadow
                this.ctx.shadowBlur = 0;
            }
            
            // Collision detection methods
            checkBallPaddleCollision(ball, paddle) {
                return ball.x >= paddle.x - paddle.width / 2 &&
                       ball.x <= paddle.x + paddle.width / 2 &&
                       ball.y + ball.radius >= paddle.y &&
                       ball.y - ball.radius <= paddle.y + paddle.height &&
                       ball.vy > 0;
            }
            
            checkBallBrickCollision(ball, brick) {
                return ball.x + ball.radius >= brick.x &&
                       ball.x - ball.radius <= brick.x + brick.width &&
                       ball.y + ball.radius >= brick.y &&
                       ball.y - ball.radius <= brick.y + brick.height;
            }
            
            checkPowerUpPaddleCollision(powerUp, paddle) {
                return powerUp.x >= paddle.x - paddle.width / 2 &&
                       powerUp.x <= paddle.x + paddle.width / 2 &&
                       powerUp.y >= paddle.y &&
                       powerUp.y <= paddle.y + paddle.height;
            }
            
            // Power-up methods
            createPowerUp(x, y) {
                const types = [
                    { type: 'multiball', color: '#00ffff', symbol: '●' },
                    { type: 'laser', color: '#ff0066', symbol: '↑' },
                    { type: 'bigpaddle', color: '#00ff88', symbol: '═' }
                ];
                
                const powerUpType = types[Math.floor(Math.random() * types.length)];
                
                this.powerUps.push({
                    x: x,
                    y: y,
                    type: powerUpType.type,
                    color: powerUpType.color,
                    symbol: powerUpType.symbol,
                    rotation: 0
                });
            }
            
            activatePowerUp(type) {
                switch (type) {
                    case 'multiball':
                        this.powerUpStates.multiball.active = true;
                        this.powerUpStates.multiball.timer = 15000;
                        
                        // Create additional balls
                        const originalBalls = [...this.balls];
                        originalBalls.forEach(ball => {
                            if (!ball.stuck) {
                                for (let i = 0; i < 2; i++) {
                                    const newBall = {
                                        x: ball.x,
                                        y: ball.y,
                                        radius: ball.radius,
                                        vx: ball.vx + (Math.random() - 0.5) * 4,
                                        vy: ball.vy + (Math.random() - 0.5) * 2,
                                        stuck: false,
                                        color: '#ff00ff',
                                        trail: []
                                    };
                                    this.balls.push(newBall);
                                }
                            }
                        });
                        break;
                        
                    case 'laser':
                        this.powerUpStates.laser.active = true;
                        this.powerUpStates.laser.timer = 20000;
                        break;
                        
                    case 'bigpaddle':
                        this.powerUpStates.bigpaddle.active = true;
                        this.powerUpStates.bigpaddle.timer = 25000;
                        this.paddle.width = 120;
                        break;
                }
            }
            
            shootLaser() {
                this.lasers.push({
                    x: this.paddle.x - 10,
                    y: this.paddle.y
                });
                this.lasers.push({
                    x: this.paddle.x + 10,
                    y: this.paddle.y
                });
            }
            
            // Particle effects
            createParticles(x, y, color, count = 8) {
                for (let i = 0; i < count; i++) {
                    const particle = document.createElement('div');
                    particle.className = 'breakout-particle';
                    particle.style.left = x + 'px';
                    particle.style.top = y + 'px';
                    particle.style.background = \`radial-gradient(circle, \${color}, transparent)\`;
                    
                    const dx = (Math.random() - 0.5) * 100;
                    const dy = (Math.random() - 0.5) * 100;
                    particle.style.setProperty('--dx', dx + 'px');
                    particle.style.setProperty('--dy', dy + 'px');
                    
                    this.particlesContainer.appendChild(particle);
                    
                    setTimeout(() => {
                        if (particle.parentNode) {
                            particle.parentNode.removeChild(particle);
                        }
                    }, 1000);
                }
            }
              // Game state methods
            gameOver() {
                this.gameState = 'gameover';
                
                // Store the final score before resetting
                const finalScore = this.score;
                
                if (this.score > this.bestScore) {
                    this.bestScore = this.score;
                    localStorage.setItem('breakout-best-score', this.bestScore.toString());
                }
                
                // Ensure lives is set to 0 for proper display
                this.lives = 0;
                
                // Reset score to 0 after game over
                this.score = 0;
                
                if (this.animationId) {
                    cancelAnimationFrame(this.animationId);
                    this.animationId = null;
                }
                
                this.updateDisplay();
                this.updateButtonVisibility();
                this.showOverlay('Game Over!', \`Final Score: \${finalScore}\`);
            }
            
            levelComplete() {
                this.gameState = 'levelcomplete';
                this.level++;
                
                if (this.animationId) {
                    cancelAnimationFrame(this.animationId);
                    this.animationId = null;
                }
                
                this.showOverlay(\`Level \${this.level - 1} Complete!\`, 'Get ready for the next level');
                
                setTimeout(() => {
                    this.gameState = 'playing';
                    this.resetLevel();
                    this.hideOverlay();
                    this.gameLoop();
                }, 2000);
            }
              // UI methods
            updateDisplay() {
                document.getElementById('breakout-score').textContent = this.score;
                document.getElementById('breakout-level').textContent = this.level;
                document.getElementById('breakout-best').textContent = this.bestScore;
                
                // Update lives display
                const livesDisplay = document.getElementById('breakout-lives-display');
                const lifeElements = livesDisplay.querySelectorAll('.breakout-life');
                lifeElements.forEach((life, index) => {
                    if (index < this.lives) {
                        life.classList.add('active');
                    } else {
                        life.classList.remove('active');
                    }
                });
            }
            
            updatePowerUpDisplay() {
                const multiBallStatus = document.getElementById('multiball-status');
                const laserStatus = document.getElementById('laser-status');
                const bigPaddleStatus = document.getElementById('bigpaddle-status');
                
                multiBallStatus.classList.toggle('active', this.powerUpStates.multiball.active);
                laserStatus.classList.toggle('active', this.powerUpStates.laser.active);
                bigPaddleStatus.classList.toggle('active', this.powerUpStates.bigpaddle.active);
            }
            
            updateButtonVisibility() {
                const startBtn = document.getElementById('breakout-start');
                const pauseBtn = document.getElementById('breakout-pause');
                
                if (this.gameState === 'playing') {
                    startBtn.style.display = 'none';
                    pauseBtn.style.display = 'inline-block';
                    pauseBtn.textContent = 'Pause';
                } else if (this.gameState === 'paused') {
                    startBtn.style.display = 'none';
                    pauseBtn.style.display = 'inline-block';
                    pauseBtn.textContent = 'Resume';
                } else {
                    startBtn.style.display = 'inline-block';
                    pauseBtn.style.display = 'none';
                }
            }
            
            showOverlay(message, subMessage) {
                const overlay = document.getElementById('breakout-overlay');
                const messageEl = document.getElementById('breakout-message');
                const subMessageEl = document.getElementById('breakout-sub-message');
                
                messageEl.textContent = message;
                subMessageEl.textContent = subMessage;
                overlay.classList.remove('hidden');
            }
            
            hideOverlay() {
                const overlay = document.getElementById('breakout-overlay');
                overlay.classList.add('hidden');
            }
        }
        
        // Initialize game when page loads
        let breakoutGame;
        
        function initBreakoutGame() {
            if (breakoutGame) {
                breakoutGame.resetGame();
            }
            breakoutGame = new BreakoutGame();
        }
        
        // Auto-initialize
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initBreakoutGame);
        } else {
            initBreakoutGame();
        }
        `;
    }
}
