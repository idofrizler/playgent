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
                    particle.style.background = `radial-gradient(circle, ${color}, transparent)`;

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
