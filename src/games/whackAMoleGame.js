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
                this.statusDisplay.textContent = `Game Over! Score: ${this.score}`;
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
