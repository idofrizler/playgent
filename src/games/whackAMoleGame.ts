import { CopilotGame } from '../gameInterface';

/**
 * Whack-a-Mole game with a slick, modern feel.
 */
export class WhackAMoleGame implements CopilotGame {
    id = 'whack-a-mole';
    name = 'Whack-a-Mole';
    description = 'Test your reflexes and whack the moles!';
    private htmlContent: string | undefined;
    private cssContent: string | undefined;
    private jsContent: string | undefined;

    constructor() {
        this.loadAssets();
    }

    private loadAssets() {
        const fs = require('fs');
        const path = require('path');
        try {
            this.htmlContent = fs.readFileSync(path.join(__dirname, 'whackAMoleGame.html'), 'utf-8');
            this.cssContent = fs.readFileSync(path.join(__dirname, 'whackAMoleGame.css'), 'utf-8');
            this.jsContent = fs.readFileSync(path.join(__dirname, 'whackAMoleGame.js'), 'utf-8');
        } catch (error) {
            console.error('Error loading game assets:', error);
            this.htmlContent = '<p>Error loading HTML content</p>';
            this.cssContent = '';
            this.jsContent = '';
        }
    }

    getHtmlContent(): string {
        return this.htmlContent || '<p>Error loading HTML content</p>';
    }

    getCssContent(): string {
        return this.cssContent || '';
    }

    getJavaScriptContent(): string {
        return this.jsContent || '';
    }
}
                <div class="whack-title">Whack-a-Mole</div>
                <div class="whack-subtitle">Test your reflexes!</div>
            </div>

            <div class="whack-stats">
                <div class="whack-stat">
                    <div class="whack-stat-label">Score</div>
                    <div class="whack-stat-value" id="whack-score">0</div>
                </div>
                <div class="whack-stat">
                    <div class="whack-stat-label">Time</div>
                    <div class="whack-stat-value" id="whack-time">30</div>
                </div>
                <div class="whack-stat">
                    <div class="whack-stat-label">Best</div>
                    <div class="whack-stat-value" id="whack-best">0</div>
                </div>
            </div>

            <div class="whack-game-area">
                <div class="whack-grid" id="whack-grid">
                    <!-- Moles will be generated here by JavaScript -->
                </div>
                <div class="whack-overlay" id="whack-overlay">
                    <div class="whack-overlay-content">
                        <div class="whack-status" id="whack-status">Ready to whack?</div>
                        <button class="whack-start-btn" id="whack-start">Start Game</button>
                    </div>
                </div>
            </div>

            <div class="whack-instructions">
                Click the moles as they appear. Don't miss!
            </div>
        </div>
        `;
    }

    getCssContent(): string {
        return `
        .whack-container {
            width: 100%;
            max-width: 500px;
            margin: 0 auto;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, rgba(30, 30, 30, 0.9), rgba(50, 50, 50, 0.9));
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
            color: var(--vscode-foreground);
        }

        .whack-header {
            text-align: center;
            margin-bottom: 25px;
        }

        .whack-title {
            font-size: 2.2rem;
            font-weight: 700;
            margin-bottom: 5px;
            background: linear-gradient(45deg, #3498db, #8e44ad);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-shadow: 0 0 20px rgba(52, 152, 219, 0.4);
        }

        .whack-subtitle {
            font-size: 1rem;
            color: var(--vscode-descriptionForeground);
            opacity: 0.8;
        }

        .whack-stats {
            display: flex;
            justify-content: space-around;
            margin-bottom: 25px;
            padding: 15px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 15px;
            backdrop-filter: blur(5px);
        }

        .whack-stat {
            text-align: center;
        }

        .whack-stat-label {
            font-size: 0.8rem;
            color: var(--vscode-descriptionForeground);
            margin-bottom: 5px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .whack-stat-value {
            font-size: 1.8rem;
            font-weight: 700;
            color: var(--vscode-textLink-foreground);
        }

        .whack-game-area {
            position: relative;
            margin-bottom: 25px;
            background: rgba(0,0,0,0.1);
            border-radius: 15px;
            padding: 15px;
        }

        .whack-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-template-rows: repeat(3, 1fr);
            gap: 15px;
            width: 100%;
            max-width: 360px; /* Adjust as needed */
            height: 360px; /* Adjust as needed */
            margin: 0 auto;
        }

        .whack-hole {
            background-color: rgba(0,0,0,0.3);
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
            overflow: hidden;
            cursor: pointer;
            border: 2px solid rgba(255,255,255,0.1);
            box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
        }

        .whack-mole {
            width: 70%;
            height: 70%;
            background-color: #8B4513; /* Brown color for mole */
            background-image: radial-gradient(circle at 50% 30%, #A0522D 30%, #8B4513 70%);
            border-radius: 50%;
            position: absolute;
            bottom: -80%; /* Start hidden */
            transition: bottom 0.15s ease-out;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        }

        .whack-mole::before { /* Eyes */
            content: '';
            position: absolute;
            width: 15%;
            height: 15%;
            background: white;
            border-radius: 50%;
            top: 25%;
            left: 25%;
            box-shadow: 0 0 2px black;
        }
        .whack-mole::after { /* Eyes */
            content: '';
            position: absolute;
            width: 15%;
            height: 15%;
            background: white;
            border-radius: 50%;
            top: 25%;
            right: 25%;
            box-shadow: 0 0 2px black;
        }

        .whack-mole.up {
            bottom: 5%; /* Mole is visible */
        }

        .whack-mole.whacked {
            background-color: #555; /* Darker when whacked */
            transform: scale(0.9) rotate(15deg);
            transition: transform 0.1s ease-out, background-color 0.1s ease-out;
        }

        .whack-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(8px);
            border-radius: 15px; /* Match game area */
            display: flex;
            justify-content: center;
            align-items: center;
            transition: opacity 0.3s ease, visibility 0.3s ease;
            z-index: 10;
            opacity: 1;
            visibility: visible;
        }

        .whack-overlay.hidden {
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
        }

        .whack-overlay-content {
            text-align: center;
            padding: 25px;
        }

        .whack-status {
            font-size: 1.8rem;
            font-weight: 600;
            color: white;
            margin-bottom: 20px;
            text-shadow: 0 0 10px rgba(255,255,255,0.5);
        }

        .whack-start-btn {
            background: linear-gradient(145deg, var(--vscode-button-background, #007ACC), var(--vscode-button-hoverBackground, #005C99));
            color: var(--vscode-button-foreground, white);
            border: none;
            padding: 12px 30px;
            border-radius: 25px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .whack-start-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        }

        .whack-start-btn:active {
            transform: translateY(0);
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }

        .whack-instructions {
            text-align: center;
            font-size: 0.9rem;
            color: var(--vscode-descriptionForeground);
            opacity: 0.7;
            margin-top: 15px;
        }

        /* Responsive adjustments */
        @media (max-width: 400px) {
            .whack-grid {
                gap: 10px;
                max-width: 300px;
                height: 300px;
            }
            .whack-title {
                font-size: 1.8rem;
            }
            .whack-stat-value {
                font-size: 1.5rem;
            }
            .whack-status {
                font-size: 1.5rem;
            }
        }
        `;
    }

    getJavaScriptContent(): string {
        return `
        class WhackAMoleGameLogic {
            constructor() {
                this.grid = document.getElementById('whack-grid');
                this.scoreDisplay = document.getElementById('whack-score');
                this.timeDisplay = document.getElementById('whack-time');
                this.bestDisplay = document.getElementById('whack-best');
                this.overlay = document.getElementById('whack-overlay');
                this.statusDisplay = document.getElementById('whack-status');
                this.startButton = document.getElementById('whack-start');

                this.holes = [];
                this.score = 0;
                this.timeLimit = 30; // seconds
                this.currentTime = this.timeLimit;
                this.gameInterval = null;
                this.moleTimeout = null;
                this.activeMole = null;
                this.isGameRunning = false;
                this.minMoleTime = 700; // ms
                this.maxMoleTime = 1500; // ms

                this.loadBestScore();
                this.createGrid();
                this.bindEvents();
            }

            createGrid() {
                this.grid.innerHTML = ''; // Clear previous grid
                for (let i = 0; i < 9; i++) {
                    const hole = document.createElement('div');
                    hole.classList.add('whack-hole');
                    const mole = document.createElement('div');
                    mole.classList.add('whack-mole');
                    hole.appendChild(mole);
                    hole.addEventListener('mousedown', () => this.whackMole(mole, hole)); // Use mousedown for quicker response
                    this.holes.push(hole);
                    this.grid.appendChild(hole);
                }
            }

            bindEvents() {
                this.startButton.addEventListener('click', () => this.startGame());
            }

            loadBestScore() {
                const best = localStorage.getItem('whack-a-mole-best-score');
                this.bestDisplay.textContent = best ? best : '0';
            }

            saveBestScore() {
                const currentBest = parseInt(this.bestDisplay.textContent);
                if (this.score > currentBest) {
                    localStorage.setItem('whack-a-mole-best-score', this.score.toString());
                    this.bestDisplay.textContent = this.score.toString();
                }
            }

            startGame() {
                if (this.isGameRunning) return;

                this.isGameRunning = true;
                this.score = 0;
                this.currentTime = this.timeLimit;
                this.scoreDisplay.textContent = this.score;
                this.timeDisplay.textContent = this.currentTime;
                this.overlay.classList.add('hidden');
                this.startButton.disabled = true;

                this.showRandomMole();
                this.gameInterval = setInterval(() => this.updateTimer(), 1000);
            }

            updateTimer() {
                this.currentTime--;
                this.timeDisplay.textContent = this.currentTime;
                if (this.currentTime <= 0) {
                    this.endGame();
                }
            }

            showRandomMole() {
                if (!this.isGameRunning) return;

                if (this.activeMole) {
                    this.activeMole.classList.remove('up');
                    this.activeMole.classList.remove('whacked');
                }

                const randomIndex = Math.floor(Math.random() * this.holes.length);
                const hole = this.holes[randomIndex];
                const mole = hole.querySelector('.whack-mole');

                mole.classList.remove('whacked'); // Ensure it's not stuck in whacked state
                mole.classList.add('up');
                this.activeMole = mole;

                const moleUpTime = Math.random() * (this.maxMoleTime - this.minMoleTime) + this.minMoleTime;
                this.moleTimeout = setTimeout(() => {
                    if (this.activeMole === mole && !mole.classList.contains('whacked')) { // Only hide if it wasn't whacked
                        mole.classList.remove('up');
                    }
                    // Show next mole only if the game is still running
                    if(this.isGameRunning) {
                        this.showRandomMole();
                    }
                }, moleUpTime);
            }

            whackMole(mole, hole) {
                if (!this.isGameRunning || !mole.classList.contains('up') || mole.classList.contains('whacked')) {
                    return;
                }

                mole.classList.add('whacked');
                this.score++;
                this.scoreDisplay.textContent = this.score;

                // Play a sound (optional)
                // try { new Audio('path/to/whack-sound.mp3').play(); } catch(e) {}

                clearTimeout(this.moleTimeout); // Stop the current mole's up-timer

                // Briefly show whacked state then hide and show next mole
                setTimeout(() => {
                    mole.classList.remove('up');
                    mole.classList.remove('whacked');
                    if (this.isGameRunning) {
                       this.showRandomMole();
                    }
                }, 200); // Short delay to see the "whacked" state
            }

            endGame() {
                this.isGameRunning = false;
                clearInterval(this.gameInterval);
                clearTimeout(this.moleTimeout);

                if (this.activeMole) {
                    this.activeMole.classList.remove('up');
                     this.activeMole.classList.remove('whacked');
                }
                this.activeMole = null;

                this.saveBestScore();
                this.statusDisplay.textContent = \`Game Over! Score: \${this.score}\`;
                this.overlay.classList.remove('hidden');
                this.startButton.textContent = 'Play Again?';
                this.startButton.disabled = false;
            }
        }

        // Initialize game when DOM is loaded
        let whackAMoleInstance;
        function initWhackAMoleGame() {
            // Clear previous instance if any, to allow restart
            if (whackAMoleInstance && whackAMoleInstance.isGameRunning) {
                whackAMoleInstance.endGame(); // Ensure cleanup
            }
            whackAMoleInstance = new WhackAMoleGameLogic();
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initWhackAMoleGame);
        } else {
            // DOMContentLoaded has already fired
            initWhackAMoleGame();
        }
        `;
    }
}
