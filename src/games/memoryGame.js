console.log('Memory game JavaScript starting...');

        try {
            class ModernMemoryGame {
                constructor() {
                    console.log('ModernMemoryGame constructor called');
                    this.currentLevel = 'easy';
                    this.cards = [];
                    this.flippedCards = [];
                    this.matchedPairs = 0;
                    this.moves = 0;
                    this.timer = 0;
                    this.timerInterval = null;
                    this.isGameActive = false;
                    this.bestScores = JSON.parse(localStorage.getItem('memory-best-scores') || '{}');
                    this.gameConfigs = {
                        easy: { pairs: 8, emojis: ['🌟', '🎮', '🎯', '🎨', '🎭', '🎪', '🚀', '🌈'] },
                        medium: { pairs: 12, emojis: ['🌟', '🎮', '🎯', '🎨', '🎭', '🎪', '🚀', '🌈', '🎲', '🎸', '🎺', '🎻'] },
                        hard: { pairs: 18, emojis: ['🌟', '🎮', '🎯', '🎨', '🎭', '🎪', '🚀', '🌈', '🎲', '🎸', '🎺', '🎻', '🎹', '🎤', '🎧', '🎬', '🎨', '🖼️'] }
                    };

                    console.log('Game configs set up');
                    this.sounds = this.createAudioContext();
                    console.log('Audio context created');
                    this.initializeGame();
                    console.log('Game initialized');
                }

            createAudioContext() {
                try {
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    return {
                        context: audioContext,
                        playSuccess: () => this.playTone(523, 200), // C5
                        playMatch: () => this.playTone(659, 300),   // E5
                        playWin: () => this.playWinSequence(),
                        playFlip: () => this.playTone(440, 100)    // A4
                    };
                } catch (e) {
                    return {
                        playSuccess: () => {},
                        playMatch: () => {},
                        playWin: () => {},
                        playFlip: () => {}
                    };
                }
            }

            playTone(frequency, duration) {
                try {
                    const oscillator = this.sounds.context.createOscillator();
                    const gainNode = this.sounds.context.createGain();

                    oscillator.connect(gainNode);
                    gainNode.connect(this.sounds.context.destination);

                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(frequency, this.sounds.context.currentTime);

                    gainNode.gain.setValueAtTime(0, this.sounds.context.currentTime);
                    gainNode.gain.linearRampToValueAtTime(0.1, this.sounds.context.currentTime + 0.01);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, this.sounds.context.currentTime + duration / 1000);

                    oscillator.start(this.sounds.context.currentTime);
                    oscillator.stop(this.sounds.context.currentTime + duration / 1000);
                } catch (e) {
                    console.log('Audio playback failed');
                }
            }

            async playWinSequence() {
                const notes = [523, 659, 784, 1047]; // C, E, G, C
                for (let note of notes) {
                    this.playTone(note, 200);
                    await this.delay(150);
                }
            }            initializeGame() {
                console.log('initializeGame called');

                // Set initial grid layout for easy mode
                const grid = document.getElementById('memory-grid');
                if (grid) {
                    grid.className = 'memory-grid ' + this.currentLevel;
                }

                // Set initial active button
                document.querySelectorAll('.memory-diff-btn').forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.level === this.currentLevel);
                });

                this.updateBestScore();
                this.bindEvents();
                this.showOverlay('Ready to play?');
                console.log('initializeGame completed');
            }

            bindEvents() {
                console.log('bindEvents called');

                // Check if elements exist
                const diffButtons = document.querySelectorAll('.memory-diff-btn');
                const startButton = document.getElementById('memory-start');

                console.log('Found', diffButtons.length, 'difficulty buttons');
                console.log('Start button:', startButton);

                // Difficulty buttons
                diffButtons.forEach((btn, index) => {
                    console.log('Binding event to button', index, btn);
                    btn.addEventListener('click', (e) => {
                        console.log('Difficulty button clicked:', e.target.dataset.level);
                        this.selectDifficulty(e.target.dataset.level);
                    });
                });

                // Start button
                if (startButton) {
                    startButton.addEventListener('click', () => {
                        console.log('Start button clicked');
                        this.startGame();
                    });
                } else {
                    console.error('Start button not found!');
                }

                console.log('bindEvents completed');
            }            selectDifficulty(level) {
                console.log('Selecting difficulty:', level);
                this.currentLevel = level;

                // Update active button
                document.querySelectorAll('.memory-diff-btn').forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.level === level);
                });

                // Update grid layout
                const grid = document.getElementById('memory-grid');
                grid.className = 'memory-grid ' + level;

                // Reset game and generate new cards for the new difficulty
                this.resetGame();
                this.generateCards();
                this.renderCards();
                this.showOverlay('Ready to play ' + level + ' mode?');
                this.updateBestScore();

                console.log('Difficulty changed to:', level);
            }

            startGame() {
                this.resetGame();
                this.generateCards();
                this.renderCards();
                this.startTimer();
                this.hideOverlay();
                this.isGameActive = true;

                // Brief preview of all cards
                setTimeout(() => this.previewCards(), 500);
            }

            async previewCards() {
                const cards = document.querySelectorAll('.memory-card');

                // Flip all cards
                cards.forEach(card => card.classList.add('flipped'));

                // Wait and flip back
                await this.delay(2000);
                cards.forEach(card => card.classList.remove('flipped'));
            }

            generateCards() {
                const config = this.gameConfigs[this.currentLevel];
                const emojis = config.emojis.slice(0, config.pairs);

                // Create pairs and shuffle
                this.cards = [...emojis, ...emojis];
                this.shuffleArray(this.cards);
            }

            shuffleArray(array) {
                for (let i = array.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [array[i], array[j]] = [array[j], array[i]];
                }
            }

            renderCards() {
                const grid = document.getElementById('memory-grid');
                grid.innerHTML = '';

                this.cards.forEach((emoji, index) => {
                    const card = document.createElement('div');
                    card.classList.add('memory-card');
                    card.dataset.index = index;
                    card.dataset.emoji = emoji;
                    card.textContent = emoji;

                    card.addEventListener('click', () => this.flipCard(card));

                    grid.appendChild(card);
                });

                this.updateProgress();
            }

            flipCard(card) {
                if (!this.isGameActive ||
                    card.classList.contains('flipped') ||
                    card.classList.contains('matched') ||
                    this.flippedCards.length >= 2) {
                    return;
                }

                // Flip the card
                card.classList.add('flipped');
                this.flippedCards.push(card);
                this.sounds.playFlip();

                // Check for match if two cards are flipped
                if (this.flippedCards.length === 2) {
                    this.moves++;
                    this.updateMoves();

                    setTimeout(() => this.checkMatch(), 600);
                }
            }

            async checkMatch() {
                const [card1, card2] = this.flippedCards;

                if (card1.dataset.emoji === card2.dataset.emoji) {
                    // Match found!
                    card1.classList.add('matched', 'celebrate');
                    card2.classList.add('matched', 'celebrate');

                    this.matchedPairs++;
                    this.sounds.playMatch();

                    // Remove celebrate animation
                    setTimeout(() => {
                        card1.classList.remove('celebrate');
                        card2.classList.remove('celebrate');
                    }, 600);

                    this.updateProgress();

                    // Check for game completion
                    if (this.matchedPairs === this.gameConfigs[this.currentLevel].pairs) {
                        setTimeout(() => this.gameComplete(), 300);
                    }
                } else {
                    // No match - add shake effect and flip back
                    card1.classList.add('shake');
                    card2.classList.add('shake');

                    setTimeout(() => {
                        card1.classList.remove('flipped', 'shake');
                        card2.classList.remove('flipped', 'shake');
                    }, 500);
                }

                this.flippedCards = [];
            }

            async gameComplete() {
                this.isGameActive = false;
                this.stopTimer();

                // Celebration animation
                const cards = document.querySelectorAll('.memory-card.matched');
                cards.forEach((card, index) => {
                    setTimeout(() => {
                        card.classList.add('celebrate');
                    }, index * 100);
                });

                this.sounds.playWin();

                // Update best score
                const currentScore = this.moves;
                if (!this.bestScores[this.currentLevel] || currentScore < this.bestScores[this.currentLevel]) {
                    this.bestScores[this.currentLevel] = currentScore;
                    localStorage.setItem('memory-best-scores', JSON.stringify(this.bestScores));
                    this.updateBestScore();
                      setTimeout(() => {
                        this.showOverlay('🎉 New Best! \\n' + this.moves + ' moves in ' + this.formatTime(this.timer));
                    }, 1000);
                } else {
                    setTimeout(() => {
                        this.showOverlay('🎊 Complete! \\n' + this.moves + ' moves in ' + this.formatTime(this.timer));
                    }, 1000);
                }
            }

            resetGame() {
                this.flippedCards = [];
                this.matchedPairs = 0;
                this.moves = 0;
                this.timer = 0;
                this.stopTimer();
                this.updateMoves();
                this.updateTimer();
                this.updateProgress();
            }

            startTimer() {
                this.timerInterval = setInterval(() => {
                    this.timer++;
                    this.updateTimer();
                }, 1000);
            }

            stopTimer() {
                if (this.timerInterval) {
                    clearInterval(this.timerInterval);
                    this.timerInterval = null;
                }
            }

            updateMoves() {
                document.getElementById('memory-moves').textContent = this.moves;
            }

            updateTimer() {
                document.getElementById('memory-time').textContent = this.formatTime(this.timer);
            }

            updateBestScore() {
                const bestElement = document.getElementById('memory-best');
                const best = this.bestScores[this.currentLevel];
                bestElement.textContent = best ? best.toString() : '--';
            }

            updateProgress() {                const totalPairs = this.gameConfigs[this.currentLevel].pairs;
                const progress = (this.matchedPairs / totalPairs) * 100;

                document.getElementById('memory-progress').style.width = progress + '%';
                document.getElementById('memory-progress-text').textContent =
                    this.matchedPairs + ' / ' + totalPairs + ' pairs found';
            }
              formatTime(seconds) {
                const mins = Math.floor(seconds / 60);
                const secs = seconds % 60;
                return mins + ':' + secs.toString().padStart(2, '0');
            }

            showOverlay(message) {
                document.getElementById('memory-status').textContent = message;
                document.getElementById('memory-overlay').classList.remove('hidden');
            }

            hideOverlay() {
                document.getElementById('memory-overlay').classList.add('hidden');
            }

            delay(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }        }

        // Initialize game when DOM is loaded
        console.log('Setting up game initialization...');
        console.log('Document readyState:', document.readyState);

        if (document.readyState === 'loading') {
            console.log('DOM still loading, waiting for DOMContentLoaded');
            document.addEventListener('DOMContentLoaded', () => {
                console.log('DOMContentLoaded fired, creating game');
                try {
                    new ModernMemoryGame();
                } catch (error) {
                    console.error('Error creating ModernMemoryGame:', error);
                }
            });
        } else {
            console.log('DOM already loaded, creating game immediately');
            try {
                new ModernMemoryGame();
            } catch (error) {
                console.error('Error creating ModernMemoryGame:', error);
            }
        }

        // Handle messages from extension
        window.addEventListener('message', event => {
            if (event.data?.type === 'stopGame') {
                console.log('Received stopGame message');
                // Handle game stop if needed
            }
        });

        } catch (globalError) {
            console.error('Global error in memory game:', globalError);
        }
