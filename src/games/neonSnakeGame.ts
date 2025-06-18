import { CopilotGame } from '../gameInterface';

/**
 * Modern Neon Snake game with cyberpunk aesthetics and smooth animations
 */
export class NeonSnakeGame implements CopilotGame {
    id = 'neon-snake';
    name = 'Neon Snake';
    description = 'Guide your cyber snake through the neon grid and grow bigger';
      getHtmlContent(): string {
        return `
        <div class="snake-container">
            <div class="snake-header">
                <div class="snake-title">Neon Snake</div>
                <div class="snake-subtitle">Survive in the cyber grid</div>
            </div>
            
            <div class="snake-stats">
                <div class="snake-stat">
                    <div class="snake-stat-label">Score</div>
                    <div class="snake-stat-value" id="snake-score">0</div>
                </div>
                <div class="snake-stat">
                    <div class="snake-stat-label">Length</div>
                    <div class="snake-stat-value" id="snake-length">3</div>
                </div>
                <div class="snake-stat">
                    <div class="snake-stat-label">Best</div>
                    <div class="snake-stat-value" id="snake-best">0</div>
                </div>
            </div>
            
            <div class="snake-game-world">
                <div class="snake-grid-container">
                    <canvas id="snake-canvas" width="400" height="400"></canvas>
                    <div class="snake-particles" id="snake-particles"></div>
                </div>
                
                <div class="snake-overlay" id="snake-overlay">
                    <div class="snake-overlay-content">
                        <div class="snake-message" id="snake-message">Ready to enter the grid?</div>
                        <div class="snake-controls">Use WASD or Arrow Keys</div>
                        <button class="snake-start-btn" id="snake-start">Start Game</button>
                    </div>
                </div>
            </div>
            
            <div class="snake-power-indicators">
                <div class="snake-power-item" id="speed-boost">
                    <div class="snake-power-icon">⚡</div>
                    <div class="snake-power-label">Speed Boost</div>
                </div>
                <div class="snake-power-item" id="score-multiplier">
                    <div class="snake-power-icon">✨</div>
                    <div class="snake-power-label">Score x2</div>
                </div>
            </div>
        </div>
        `;
    }
    
    getCssContent(): string {
        return `
            .snake-container {
                background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
                min-height: 100vh;
                padding: 20px;
                font-family: 'Courier New', monospace;
                color: #00ffff;
                position: relative;
                overflow: hidden;
            }
            
            .snake-container::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: 
                    radial-gradient(circle at 20% 80%, rgba(0, 255, 255, 0.1) 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, rgba(255, 0, 255, 0.1) 0%, transparent 50%);
                pointer-events: none;
                z-index: 1;
            }
            
            .snake-header {
                text-align: center;
                margin-bottom: 30px;
                position: relative;
                z-index: 2;
            }
            
            .snake-title {
                font-size: 2.5rem;
                font-weight: bold;
                background: linear-gradient(45deg, #00ffff, #ff00ff, #00ff00);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                text-shadow: 0 0 30px rgba(0, 255, 255, 0.5);
                margin-bottom: 10px;
                animation: neonPulse 2s ease-in-out infinite alternate;
            }
            
            @keyframes neonPulse {
                from { text-shadow: 0 0 30px rgba(0, 255, 255, 0.5); }
                to { text-shadow: 0 0 40px rgba(0, 255, 255, 0.8), 0 0 60px rgba(255, 0, 255, 0.3); }
            }
            
            .snake-subtitle {
                font-size: 1.1rem;
                color: #888;
                text-transform: uppercase;
                letter-spacing: 2px;
            }
            
            .snake-stats {
                display: flex;
                justify-content: center;
                gap: 40px;
                margin-bottom: 30px;
                position: relative;
                z-index: 2;
            }
            
            .snake-stat {
                background: rgba(0, 255, 255, 0.1);
                border: 1px solid rgba(0, 255, 255, 0.3);
                border-radius: 10px;
                padding: 15px 25px;
                text-align: center;
                backdrop-filter: blur(10px);
                box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
            }
            
            .snake-stat-label {
                font-size: 0.9rem;
                color: #aaa;
                margin-bottom: 5px;
                text-transform: uppercase;
            }
            
            .snake-stat-value {
                font-size: 1.8rem;
                font-weight: bold;
                color: #00ffff;
                text-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
            }
            
            .snake-game-world {
                display: flex;
                justify-content: center;
                margin-bottom: 30px;
                position: relative;
                z-index: 2;
            }
            
            .snake-grid-container {
                position: relative;
                border: 2px solid rgba(0, 255, 255, 0.5);
                border-radius: 15px;
                background: rgba(0, 0, 0, 0.5);
                box-shadow: 
                    0 0 30px rgba(0, 255, 255, 0.3),
                    inset 0 0 30px rgba(0, 255, 255, 0.1);
                overflow: hidden;
            }
            
            #snake-canvas {
                display: block;
                background: transparent;
            }
            
            .snake-particles {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 1;
            }
            
            .snake-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10;
                backdrop-filter: blur(5px);
            }
            
            .snake-overlay.hidden {
                display: none;
            }
            
            .snake-overlay-content {
                text-align: center;
                color: #00ffff;
            }
            
            .snake-message {
                font-size: 1.5rem;
                margin-bottom: 15px;
                text-shadow: 0 0 20px rgba(0, 255, 255, 0.8);
            }
            
            .snake-controls {
                font-size: 1rem;
                color: #aaa;
                margin-bottom: 25px;
            }
            
            .snake-start-btn {
                background: linear-gradient(45deg, #00ffff, #ff00ff);
                border: none;
                color: #000;
                padding: 15px 30px;
                font-size: 1.1rem;
                font-weight: bold;
                border-radius: 25px;
                cursor: pointer;
                text-transform: uppercase;
                letter-spacing: 1px;
                transition: all 0.3s ease;
                box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
            }
            
            .snake-start-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 25px rgba(0, 255, 255, 0.7);
            }
            
            .snake-power-indicators {
                display: flex;
                justify-content: center;
                gap: 20px;
                position: relative;
                z-index: 2;
            }
            
            .snake-power-item {
                display: flex;
                align-items: center;
                gap: 10px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 20px;
                padding: 10px 15px;
                opacity: 0.5;
                transition: all 0.3s ease;
            }
            
            .snake-power-item.active {
                opacity: 1;
                background: rgba(0, 255, 0, 0.1);
                border-color: rgba(0, 255, 0, 0.5);
                box-shadow: 0 0 15px rgba(0, 255, 0, 0.3);
            }
            
            .snake-power-icon {
                font-size: 1.2rem;
            }
            
            .snake-power-label {
                font-size: 0.9rem;
                color: #ccc;
            }
            
            .particle {
                position: absolute;
                width: 4px;
                height: 4px;
                background: radial-gradient(circle, #00ffff, transparent);
                border-radius: 50%;
                pointer-events: none;
                animation: particleFloat 2s ease-out forwards;
            }
            
            @keyframes particleFloat {
                0% {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
                100% {
                    opacity: 0;
                    transform: translateY(-50px) scale(0);
                }
            }
        `;
    }
    
    getJavaScriptContent(): string {
        return `
            class NeonSnakeGame {
                constructor() {
                    this.canvas = document.getElementById('snake-canvas');
                    this.ctx = this.canvas.getContext('2d');
                    this.gridSize = 20;
                    this.gridWidth = this.canvas.width / this.gridSize;
                    this.gridHeight = this.canvas.height / this.gridSize;
                    
                    this.snake = [{x: 10, y: 10}];
                    this.direction = {x: 1, y: 0};
                    this.nextDirection = {x: 1, y: 0};
                    this.food = this.generateFood();
                    this.powerUps = [];
                    
                    this.score = 0;
                    this.length = 3;
                    this.gameRunning = false;
                    this.gameSpeed = 150;
                    this.speedBoost = false;
                    this.scoreMultiplier = false;
                    
                    this.loadBestScore();
                    this.setupEventListeners();
                    this.setupUI();
                }
                
                setupEventListeners() {
                    document.getElementById('snake-start').addEventListener('click', () => this.startGame());
                    
                    document.addEventListener('keydown', (e) => {
                        if (!this.gameRunning) return;
                        
                        switch(e.key.toLowerCase()) {
                            case 'w':
                            case 'arrowup':
                                if (this.direction.y === 0) this.nextDirection = {x: 0, y: -1};
                                break;
                            case 's':
                            case 'arrowdown':
                                if (this.direction.y === 0) this.nextDirection = {x: 0, y: 1};
                                break;
                            case 'a':
                            case 'arrowleft':
                                if (this.direction.x === 0) this.nextDirection = {x: -1, y: 0};
                                break;
                            case 'd':
                            case 'arrowright':
                                if (this.direction.x === 0) this.nextDirection = {x: 1, y: 0};
                                break;
                        }
                        e.preventDefault();
                    });
                }
                
                setupUI() {
                    this.updateScore();
                    this.updateLength();
                    this.updateBestScore();
                }
                
                startGame() {
                    this.snake = [{x: 10, y: 10}];
                    this.direction = {x: 1, y: 0};
                    this.nextDirection = {x: 1, y: 0};
                    this.food = this.generateFood();
                    this.powerUps = [];
                    this.score = 0;
                    this.length = 3;
                    this.gameSpeed = 150;
                    this.speedBoost = false;
                    this.scoreMultiplier = false;
                    
                    this.updateScore();
                    this.updateLength();
                    this.updatePowerUps();
                    
                    document.getElementById('snake-overlay').classList.add('hidden');
                    this.gameRunning = true;
                    
                    this.gameLoop();
                }
                
                gameLoop() {
                    if (!this.gameRunning) return;
                    
                    this.update();
                    this.draw();
                    
                    const speed = this.speedBoost ? this.gameSpeed / 2 : this.gameSpeed;
                    setTimeout(() => this.gameLoop(), speed);
                }
                
                update() {
                    this.direction = this.nextDirection;
                    
                    const head = {
                        x: this.snake[0].x + this.direction.x,
                        y: this.snake[0].y + this.direction.y
                    };
                    
                    // Check wall collision
                    if (head.x < 0 || head.x >= this.gridWidth || head.y < 0 || head.y >= this.gridHeight) {
                        this.gameOver();
                        return;
                    }
                    
                    // Check self collision
                    if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
                        this.gameOver();
                        return;
                    }
                    
                    this.snake.unshift(head);
                    
                    // Check food collision
                    if (head.x === this.food.x && head.y === this.food.y) {
                        this.eatFood();
                    } else {
                        if (this.snake.length > this.length) {
                            this.snake.pop();
                        }
                    }
                    
                    // Check power-up collisions
                    this.powerUps = this.powerUps.filter(powerUp => {
                        if (head.x === powerUp.x && head.y === powerUp.y) {
                            this.collectPowerUp(powerUp);
                            return false;
                        }
                        return true;
                    });
                    
                    // Randomly spawn power-ups
                    if (Math.random() < 0.005 && this.powerUps.length < 2) {
                        this.spawnPowerUp();
                    }
                }
                
                eatFood() {
                    const multiplier = this.scoreMultiplier ? 2 : 1;
                    this.score += 10 * multiplier;
                    this.length++;
                    
                    this.updateScore();
                    this.updateLength();
                    
                    this.food = this.generateFood();
                    this.createFoodParticles();
                    
                    // Increase speed slightly
                    this.gameSpeed = Math.max(80, this.gameSpeed - 2);
                }
                
                generateFood() {
                    let food;
                    do {
                        food = {
                            x: Math.floor(Math.random() * this.gridWidth),
                            y: Math.floor(Math.random() * this.gridHeight)
                        };
                    } while (this.snake.some(segment => segment.x === food.x && segment.y === food.y) ||
                             this.powerUps.some(powerUp => powerUp.x === food.x && powerUp.y === food.y));
                    return food;
                }
                
                spawnPowerUp() {
                    const types = ['speed', 'multiplier'];
                    const type = types[Math.floor(Math.random() * types.length)];
                    
                    let powerUp;
                    do {
                        powerUp = {
                            x: Math.floor(Math.random() * this.gridWidth),
                            y: Math.floor(Math.random() * this.gridHeight),
                            type: type,
                            duration: 5000 // 5 seconds
                        };
                    } while (this.snake.some(segment => segment.x === powerUp.x && segment.y === powerUp.y) ||
                             (powerUp.x === this.food.x && powerUp.y === this.food.y));
                    
                    this.powerUps.push(powerUp);
                }
                
                collectPowerUp(powerUp) {
                    if (powerUp.type === 'speed') {
                        this.speedBoost = true;
                        setTimeout(() => {
                            this.speedBoost = false;
                            this.updatePowerUps();
                        }, powerUp.duration);
                    } else if (powerUp.type === 'multiplier') {
                        this.scoreMultiplier = true;
                        setTimeout(() => {
                            this.scoreMultiplier = false;
                            this.updatePowerUps();
                        }, powerUp.duration);
                    }
                    
                    this.updatePowerUps();
                    this.createPowerUpParticles(powerUp.x * this.gridSize, powerUp.y * this.gridSize);
                }
                
                draw() {
                    // Clear canvas
                    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
                    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                    
                    // Draw grid
                    this.drawGrid();
                    
                    // Draw snake
                    this.drawSnake();
                    
                    // Draw food
                    this.drawFood();
                    
                    // Draw power-ups
                    this.drawPowerUps();
                }
                
                drawGrid() {
                    this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
                    this.ctx.lineWidth = 1;
                    
                    for (let x = 0; x <= this.gridWidth; x++) {
                        this.ctx.beginPath();
                        this.ctx.moveTo(x * this.gridSize, 0);
                        this.ctx.lineTo(x * this.gridSize, this.canvas.height);
                        this.ctx.stroke();
                    }
                    
                    for (let y = 0; y <= this.gridHeight; y++) {
                        this.ctx.beginPath();
                        this.ctx.moveTo(0, y * this.gridSize);
                        this.ctx.lineTo(this.canvas.width, y * this.gridSize);
                        this.ctx.stroke();
                    }
                }
                
                drawSnake() {
                    this.snake.forEach((segment, index) => {
                        const x = segment.x * this.gridSize;
                        const y = segment.y * this.gridSize;
                        
                        if (index === 0) {
                            // Head
                            const gradient = this.ctx.createRadialGradient(
                                x + this.gridSize/2, y + this.gridSize/2, 0,
                                x + this.gridSize/2, y + this.gridSize/2, this.gridSize/2
                            );
                            gradient.addColorStop(0, '#00ffff');
                            gradient.addColorStop(1, '#0080ff');
                            
                            this.ctx.fillStyle = gradient;
                            this.ctx.shadowBlur = 15;
                            this.ctx.shadowColor = '#00ffff';
                        } else {
                            // Body
                            const gradient = this.ctx.createLinearGradient(x, y, x + this.gridSize, y + this.gridSize);
                            gradient.addColorStop(0, '#00aa00');
                            gradient.addColorStop(1, '#008800');
                            
                            this.ctx.fillStyle = gradient;
                            this.ctx.shadowBlur = 10;
                            this.ctx.shadowColor = '#00ff00';
                        }
                        
                        this.ctx.fillRect(x + 1, y + 1, this.gridSize - 2, this.gridSize - 2);
                        this.ctx.shadowBlur = 0;
                    });
                }
                
                drawFood() {
                    const x = this.food.x * this.gridSize;
                    const y = this.food.y * this.gridSize;
                    
                    const gradient = this.ctx.createRadialGradient(
                        x + this.gridSize/2, y + this.gridSize/2, 0,
                        x + this.gridSize/2, y + this.gridSize/2, this.gridSize/2
                    );
                    gradient.addColorStop(0, '#ff00ff');
                    gradient.addColorStop(1, '#ff0080');
                    
                    this.ctx.fillStyle = gradient;
                    this.ctx.shadowBlur = 20;
                    this.ctx.shadowColor = '#ff00ff';
                    
                    this.ctx.beginPath();
                    this.ctx.arc(x + this.gridSize/2, y + this.gridSize/2, this.gridSize/2 - 2, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.shadowBlur = 0;
                }
                
                drawPowerUps() {
                    this.powerUps.forEach(powerUp => {
                        const x = powerUp.x * this.gridSize;
                        const y = powerUp.y * this.gridSize;
                        
                        let color = powerUp.type === 'speed' ? '#ffff00' : '#ff8000';
                        
                        this.ctx.fillStyle = color;
                        this.ctx.shadowBlur = 15;
                        this.ctx.shadowColor = color;
                        
                        this.ctx.beginPath();
                        this.ctx.arc(x + this.gridSize/2, y + this.gridSize/2, this.gridSize/3, 0, Math.PI * 2);
                        this.ctx.fill();
                        this.ctx.shadowBlur = 0;
                    });
                }
                
                createFoodParticles() {
                    const x = this.food.x * this.gridSize + this.gridSize/2;
                    const y = this.food.y * this.gridSize + this.gridSize/2;
                    
                    for (let i = 0; i < 8; i++) {
                        this.createParticle(x, y, '#ff00ff');
                    }
                }
                
                createPowerUpParticles(x, y) {
                    for (let i = 0; i < 12; i++) {
                        this.createParticle(x + this.gridSize/2, y + this.gridSize/2, '#ffff00');
                    }
                }
                
                createParticle(x, y, color) {
                    const particle = document.createElement('div');
                    particle.className = 'particle';
                    particle.style.left = x + 'px';
                    particle.style.top = y + 'px';
                    particle.style.background = \`radial-gradient(circle, \${color}, transparent)\`;
                    
                    const angle = Math.random() * Math.PI * 2;
                    const distance = Math.random() * 30 + 10;
                    const endX = x + Math.cos(angle) * distance;
                    const endY = y + Math.sin(angle) * distance;
                    
                    particle.style.setProperty('--end-x', endX + 'px');
                    particle.style.setProperty('--end-y', endY + 'px');
                    
                    document.getElementById('snake-particles').appendChild(particle);
                    
                    setTimeout(() => particle.remove(), 2000);
                }
                
                updateScore() {
                    document.getElementById('snake-score').textContent = this.score;
                }
                
                updateLength() {
                    document.getElementById('snake-length').textContent = this.length;
                }
                
                updateBestScore() {
                    const best = localStorage.getItem('neon-snake-best') || 0;
                    document.getElementById('snake-best').textContent = best;
                }
                
                updatePowerUps() {
                    document.getElementById('speed-boost').classList.toggle('active', this.speedBoost);
                    document.getElementById('score-multiplier').classList.toggle('active', this.scoreMultiplier);
                }
                
                loadBestScore() {
                    this.bestScore = parseInt(localStorage.getItem('neon-snake-best')) || 0;
                }
                
                saveBestScore() {
                    if (this.score > this.bestScore) {
                        this.bestScore = this.score;
                        localStorage.setItem('neon-snake-best', this.bestScore.toString());
                        this.updateBestScore();
                    }
                }
                
                gameOver() {
                    this.gameRunning = false;
                    this.saveBestScore();
                    
                    document.getElementById('snake-message').textContent = 'Game Over!';
                    document.getElementById('snake-start').textContent = 'Play Again';
                    document.getElementById('snake-overlay').classList.remove('hidden');
                }
            }
            
            // Initialize game when page loads
            document.addEventListener('DOMContentLoaded', () => {
                new NeonSnakeGame();
            });
        `;
    }
}
