class SimonSaysGame {
            constructor() {
                this.sequence = [];
                this.playerSequence = [];
                this.level = 1;
                this.isPlaying = false;
                this.isPlayerTurn = false;
                this.colors = ['red', 'blue', 'green', 'yellow'];
                this.sounds = this.createAudioContext();
                this.bestScore = parseInt(localStorage.getItem('simon-best-score') || '0');

                this.initializeGame();
            }

            createAudioContext() {
                // Create simple audio feedback using Web Audio API
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const frequencies = {
                    red: 220,    // A3
                    blue: 277,   // C#4
                    green: 330,  // E4
                    yellow: 415  // G#4
                };

                return {
                    context: audioContext,
                    frequencies: frequencies,
                    playTone: (color, duration = 400) => {
                        const oscillator = audioContext.createOscillator();
                        const gainNode = audioContext.createGain();

                        oscillator.connect(gainNode);
                        gainNode.connect(audioContext.destination);

                        oscillator.type = 'sine';
                        oscillator.frequency.setValueAtTime(frequencies[color], audioContext.currentTime);

                        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                        gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
                        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration / 1000);

                        oscillator.start(audioContext.currentTime);
                        oscillator.stop(audioContext.currentTime + duration / 1000);
                    }
                };
            }

            initializeGame() {
                this.updateDisplay();
                this.updateBestScore();
                this.bindEvents();
            }

            bindEvents() {
                const startBtn = document.getElementById('simon-start');
                const buttons = document.querySelectorAll('.simon-button');

                startBtn.addEventListener('click', () => this.startGame());

                buttons.forEach(button => {
                    button.addEventListener('click', (e) => {
                        if (this.isPlayerTurn) {
                            const color = e.currentTarget.dataset.color;
                            this.handlePlayerInput(color);
                        }
                    });

                    // Add touch support
                    button.addEventListener('touchstart', (e) => {
                        e.preventDefault();
                        if (this.isPlayerTurn) {
                            const color = e.currentTarget.dataset.color;
                            this.handlePlayerInput(color);
                        }
                    });
                });
            }

            startGame() {
                this.sequence = [];
                this.playerSequence = [];
                this.level = 1;
                this.isPlaying = true;
                this.isPlayerTurn = false;

                document.getElementById('simon-start').disabled = true;
                document.getElementById('simon-score').textContent = '0';

                setTimeout(() => this.nextRound(), 500);
            }

            nextRound() {
                this.playerSequence = [];
                this.isPlayerTurn = false;

                // Add new color to sequence
                const randomColor = this.colors[Math.floor(Math.random() * this.colors.length)];
                this.sequence.push(randomColor);

                this.updateDisplay('Watch the pattern');
                this.level = this.sequence.length;
                document.getElementById('simon-level').textContent = this.level;

                // Play sequence
                setTimeout(() => this.playSequence(), 800);
            }

            async playSequence() {
                const board = document.querySelector('.simon-board');
                board.classList.add('thinking');

                for (let i = 0; i < this.sequence.length; i++) {
                    await this.delay(200);
                    await this.flashButton(this.sequence[i]);
                    await this.delay(100);
                }

                board.classList.remove('thinking');
                this.isPlayerTurn = true;
                this.updateDisplay('Your turn!');
            }

            async flashButton(color) {
                const button = document.getElementById(`simon-${color}`);

                // Play sound
                try {
                    this.sounds.playTone(color);
                } catch (e) {
                    // Fallback if audio fails
                    console.log(`Playing ${color}`);
                }

                // Visual feedback
                button.classList.add('flash');
                await this.delay(400);
                button.classList.remove('flash');
            }

            async handlePlayerInput(color) {
                if (!this.isPlayerTurn) return;

                const button = document.getElementById(`simon-${color}`);

                // Visual and audio feedback
                button.classList.add('active');
                try {
                    this.sounds.playTone(color, 200);
                } catch (e) {
                    console.log(`Player pressed ${color}`);
                }

                setTimeout(() => button.classList.remove('active'), 200);

                this.playerSequence.push(color);

                // Check if input is correct
                const currentIndex = this.playerSequence.length - 1;
                if (this.playerSequence[currentIndex] !== this.sequence[currentIndex]) {
                    this.gameOver();
                    return;
                }

                // Check if sequence is complete
                if (this.playerSequence.length === this.sequence.length) {
                    this.isPlayerTurn = false;
                    this.updateScore();

                    if (this.level >= 20) {
                        this.gameWin();
                    } else {
                        this.updateDisplay('Nice! Next round...');
                        setTimeout(() => this.nextRound(), 1200);
                    }
                }
            }

            updateScore() {
                const score = this.level;
                document.getElementById('simon-score').textContent = score;

                if (score > this.bestScore) {
                    this.bestScore = score;
                    localStorage.setItem('simon-best-score', this.bestScore.toString());
                    this.updateBestScore();
                }
            }

            updateBestScore() {
                document.getElementById('simon-best').textContent = this.bestScore;
            }

            updateDisplay(message = 'Watch the pattern') {
                document.getElementById('simon-status').textContent = message;
            }

            gameOver() {
                this.isPlaying = false;
                this.isPlayerTurn = false;

                this.updateDisplay('Game Over!');

                // Flash all buttons red briefly
                const buttons = document.querySelectorAll('.simon-button');
                buttons.forEach(button => {
                    button.style.filter = 'hue-rotate(0deg) saturate(2) brightness(0.7)';
                });

                setTimeout(() => {
                    buttons.forEach(button => {
                        button.style.filter = '';
                    });
                    this.resetGame();
                }, 1000);
            }

            gameWin() {
                this.isPlaying = false;
                this.isPlayerTurn = false;

                this.updateDisplay('You won! Amazing!');

                // Celebration effect
                const buttons = document.querySelectorAll('.simon-button');
                let colorIndex = 0;
                const celebrationInterval = setInterval(() => {
                    buttons.forEach((button, index) => {
                        if (index === colorIndex % buttons.length) {
                            button.classList.add('flash');
                            setTimeout(() => button.classList.remove('flash'), 200);
                        }
                    });
                    colorIndex++;
                    if (colorIndex > 12) {
                        clearInterval(celebrationInterval);
                        this.resetGame();
                    }
                }, 150);
            }

            resetGame() {
                setTimeout(() => {
                    document.getElementById('simon-start').disabled = false;
                    this.updateDisplay('Ready to play?');
                    document.getElementById('simon-level').textContent = '1';
                }, 500);
            }

            delay(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }
        }

        // Initialize game when DOM is loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                new SimonSaysGame();
            });
        } else {
            new SimonSaysGame();
        }
