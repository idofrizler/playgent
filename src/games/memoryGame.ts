import { CopilotGame } from '../gameInterface';

/**
 * Modern Memory Card game with polished UX and smooth animations
 */
export class MemoryGame implements CopilotGame {
    id = 'memory-game';
    name = 'Memory Cards';
    description = 'Match pairs of cards with style';
    
    getHtmlContent(): string {
        return `
        <div class="memory-container">
            <div class="memory-header">
                <div class="memory-title">Memory Cards</div>
                <div class="memory-subtitle">Find matching pairs</div>
            </div>
            
            <div class="memory-stats">
                <div class="memory-stat">
                    <div class="memory-stat-label">Moves</div>
                    <div class="memory-stat-value" id="memory-moves">0</div>
                </div>
                <div class="memory-stat">
                    <div class="memory-stat-label">Time</div>
                    <div class="memory-stat-value" id="memory-time">0:00</div>
                </div>
                <div class="memory-stat">
                    <div class="memory-stat-label">Best</div>
                    <div class="memory-stat-value" id="memory-best">--</div>
                </div>
            </div>
              <div class="memory-difficulty">
                <button class="memory-diff-btn active" data-level="easy">Easy</button>
                <button class="memory-diff-btn" data-level="medium">Medium</button>
                <button class="memory-diff-btn" data-level="hard">Hard</button>
            </div>
            
            <div class="memory-game-area">
                <div class="memory-grid" id="memory-grid"></div>
                <div class="memory-overlay" id="memory-overlay">
                    <div class="memory-overlay-content">
                        <div class="memory-status" id="memory-status">Ready to play?</div>
                        <button class="memory-start-btn" id="memory-start">Start Game</button>
                    </div>
                </div>
            </div>
            
            <div class="memory-progress">
                <div class="memory-progress-bar">
                    <div class="memory-progress-fill" id="memory-progress"></div>
                </div>
                <div class="memory-progress-text" id="memory-progress-text">0 / 0 pairs found</div>
            </div>
        </div>
        `;
    }
    
    getCssContent(): string {
        return `
        .memory-container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, rgba(30, 30, 30, 0.9), rgba(50, 50, 50, 0.9));
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
        }
        
        .memory-header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .memory-title {
            font-size: 32px;
            font-weight: 700;
            color: var(--vscode-foreground);
            margin-bottom: 8px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .memory-subtitle {
            font-size: 16px;
            color: var(--vscode-descriptionForeground);
            opacity: 0.8;
        }
        
        .memory-stats {
            display: flex;
            justify-content: space-around;
            margin-bottom: 25px;
            padding: 20px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 15px;
            backdrop-filter: blur(10px);
        }
        
        .memory-stat {
            text-align: center;
        }
        
        .memory-stat-label {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            margin-bottom: 5px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .memory-stat-value {
            font-size: 24px;
            font-weight: 700;
            color: var(--vscode-textLink-foreground);
        }
          .memory-difficulty {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-bottom: 25px;
            position: relative;
            z-index: 20;
        }
          .memory-diff-btn {
            background: rgba(255, 255, 255, 0.1);
            color: var(--vscode-foreground);
            border: 1px solid rgba(255, 255, 255, 0.2);
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            backdrop-filter: blur(10px);
            position: relative;
            z-index: 21;
            pointer-events: auto;
        }
        
        .memory-diff-btn:hover {
            background: rgba(255, 255, 255, 0.15);
            transform: translateY(-1px);
        }
        
        .memory-diff-btn.active {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border-color: var(--vscode-button-background);
        }
        
        .memory-game-area {
            position: relative;
            margin-bottom: 25px;
        }        .memory-grid {
            display: grid;
            gap: 8px;
            padding: 20px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 15px;
            min-height: 320px;
            grid-template-columns: repeat(6, 1fr);
            justify-content: center;
            max-width: 540px;
            margin: 0 auto;
        }
        
        .memory-grid.easy {
            grid-template-columns: repeat(4, 1fr);
            max-width: 360px;
        }
        
        .memory-grid.medium {
            grid-template-columns: repeat(6, 1fr);
            max-width: 540px;
        }
        
        .memory-grid.hard {
            grid-template-columns: repeat(6, 1fr);
            max-width: 540px;
        }
        
        .memory-card {
            width: 80px;
            height: 80px;
            background: linear-gradient(145deg, rgba(80, 80, 80, 1), rgba(60, 60, 60, 1));
            border-radius: 12px;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 32px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            transform-style: preserve-3d;
        }
          .memory-card:before {
            content: '?';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            background: linear-gradient(145deg, rgba(100, 100, 100, 1), rgba(70, 70, 70, 1));
            color: var(--vscode-descriptionForeground);
            font-size: 24px;
            font-weight: 600;
            border-radius: inherit;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            backface-visibility: hidden;
        }
          .memory-card:hover:before {
            background: linear-gradient(145deg, rgba(120, 120, 120, 1), rgba(90, 90, 90, 1));
            transform: scale(0.95);
        }
        
        .memory-card.flipped:before {
            transform: rotateY(180deg);
            opacity: 0;
        }
        
        .memory-card.flipped {
            background: linear-gradient(145deg, rgba(255, 255, 255, 1), rgba(230, 230, 230, 1));
            color: #333;
            transform: rotateY(180deg) scale(1.05);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }
        
        .memory-card.matched {
            background: linear-gradient(145deg, #2ed573, #1e824c);
            color: white;
            transform: scale(0.9);
            cursor: default;
            box-shadow: 0 0 20px rgba(46, 213, 115, 0.4);
        }
        
        .memory-card.matched:before {
            display: none;
        }
        
        .memory-card.shake {
            animation: shake 0.5s ease-in-out;
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
          .memory-overlay {
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
            z-index: 15;
        }
        
        .memory-overlay.hidden {
            opacity: 0;
            pointer-events: none;
            visibility: hidden;
        }
        
        .memory-overlay-content {
            text-align: center;
            padding: 30px;
        }
        
        .memory-status {
            font-size: 24px;
            font-weight: 600;
            color: white;
            margin-bottom: 20px;
        }
          .memory-start-btn {
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
            position: relative;
            z-index: 16;
        }
        
        .memory-start-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        }
        
        .memory-start-btn:active {
            transform: translateY(0);
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }
        
        .memory-progress {
            text-align: center;
        }
        
        .memory-progress-bar {
            width: 100%;
            height: 8px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 10px;
        }
        
        .memory-progress-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--vscode-textLink-foreground), var(--vscode-button-background));
            border-radius: 4px;
            width: 0%;
            transition: width 0.3s ease;
        }
        
        .memory-progress-text {
            font-size: 14px;
            color: var(--vscode-descriptionForeground);
        }
        
        @keyframes celebrate {
            0%, 100% { transform: scale(1) rotate(0deg); }
            25% { transform: scale(1.1) rotate(-5deg); }
            75% { transform: scale(1.1) rotate(5deg); }
        }
        
        .memory-card.celebrate {
            animation: celebrate 0.6s ease-in-out;
        }
        
        @media (max-width: 600px) {
            .memory-container {
                margin: 10px;
                padding: 15px;
            }
            
            .memory-grid.hard {
                grid-template-columns: repeat(4, 1fr);
            }
            
            .memory-card {
                font-size: 20px;
            }
            
            .memory-stats {
                flex-direction: column;
                gap: 15px;
            }
            
            .memory-stat {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .memory-stat-label {
                margin-bottom: 0;
            }
        }
        `;
    }
        getJavaScriptContent(): string {
        return `
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
        `;
    }
}