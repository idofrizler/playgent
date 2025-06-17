import { CopilotGame } from '../gameInterface';

/**
 * Modern Simon Says game with polished UX and smooth animations
 */
export class SimonGame implements CopilotGame {
    id = 'simon-game';
    name = 'Simon Says';
    description = 'Repeat the pattern of colors - memory challenge';
    
    getHtmlContent(): string {
        return `
        <div class="simon-container">
            <div class="simon-header">
                <div class="simon-title">Simon Says</div>
                <div class="simon-subtitle">Watch, remember, repeat</div>
            </div>
            
            <div class="simon-game-area">
                <div class="simon-board">
                    <div class="simon-center">
                        <div class="simon-display">
                            <div class="simon-level">Round <span id="simon-level">1</span></div>
                            <div class="simon-status" id="simon-status">Watch the pattern</div>
                        </div>
                    </div>
                    
                    <div class="simon-button simon-button-red" data-color="red" id="simon-red">
                        <div class="simon-button-inner"></div>
                    </div>
                    <div class="simon-button simon-button-blue" data-color="blue" id="simon-blue">
                        <div class="simon-button-inner"></div>
                    </div>
                    <div class="simon-button simon-button-green" data-color="green" id="simon-green">
                        <div class="simon-button-inner"></div>
                    </div>
                    <div class="simon-button simon-button-yellow" data-color="yellow" id="simon-yellow">
                        <div class="simon-button-inner"></div>
                    </div>
                </div>
                
                <div class="simon-controls">
                    <button class="simon-start-btn" id="simon-start">Start Game</button>
                    <div class="simon-score">
                        <div class="simon-current">Score: <span id="simon-score">0</span></div>
                        <div class="simon-best">Best: <span id="simon-best">0</span></div>
                    </div>
                </div>
            </div>
        </div>
        `;
    }
    
    getCssContent(): string {
        return `
        .simon-container {
            width: 100%;
            max-width: 480px;
            margin: 0 auto;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, rgba(30, 30, 30, 0.9), rgba(50, 50, 50, 0.9));
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
        }
        
        .simon-header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .simon-title {
            font-size: 32px;
            font-weight: 700;
            color: var(--vscode-foreground);
            margin-bottom: 8px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .simon-subtitle {
            font-size: 16px;
            color: var(--vscode-descriptionForeground);
            opacity: 0.8;
        }
        
        .simon-game-area {
            position: relative;
        }
        
        .simon-board {
            position: relative;
            width: 320px;
            height: 320px;
            margin: 0 auto 30px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(60, 60, 60, 0.8), rgba(40, 40, 40, 0.9));
            box-shadow: 
                inset 0 0 30px rgba(0, 0, 0, 0.5),
                0 10px 30px rgba(0, 0, 0, 0.3);
        }
        
        .simon-center {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 120px;
            height: 120px;
            background: linear-gradient(145deg, rgba(80, 80, 80, 0.9), rgba(50, 50, 50, 0.9));
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 
                0 0 20px rgba(0, 0, 0, 0.5),
                inset 0 2px 4px rgba(255, 255, 255, 0.1);
            z-index: 10;
        }
        
        .simon-display {
            text-align: center;
        }
        
        .simon-level {
            font-size: 18px;
            font-weight: 600;
            color: var(--vscode-foreground);
            margin-bottom: 4px;
        }
        
        .simon-status {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            opacity: 0.9;
        }
        
        .simon-button {
            position: absolute;
            width: 140px;
            height: 140px;
            border-radius: 20px;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }
        
        .simon-button:before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(0, 0, 0, 0.1));
            border-radius: inherit;
            opacity: 0;
            transition: opacity 0.2s ease;
        }
        
        .simon-button:hover:before {
            opacity: 1;
        }
        
        .simon-button-inner {
            width: 100%;
            height: 100%;
            border-radius: inherit;
            background: inherit;
            transition: all 0.15s ease;
        }
          .simon-button-red {
            top: 20px;
            left: 20px;
            background: linear-gradient(145deg, #ff4757, #c44569);
            border-top-left-radius: 50%;
            border-top-right-radius: 20px;
            border-bottom-left-radius: 20px;
            border-bottom-right-radius: 20px;
        }
        
        .simon-button-blue {
            top: 20px;
            right: 20px;
            background: linear-gradient(145deg, #3742fa, #2f3542);
            border-top-right-radius: 50%;
            border-top-left-radius: 20px;
            border-bottom-left-radius: 20px;
            border-bottom-right-radius: 20px;
        }
        
        .simon-button-green {
            bottom: 20px;
            left: 20px;
            background: linear-gradient(145deg, #2ed573, #1e824c);
            border-bottom-left-radius: 50%;
            border-top-left-radius: 20px;
            border-top-right-radius: 20px;
            border-bottom-right-radius: 20px;
        }
        
        .simon-button-yellow {
            bottom: 20px;
            right: 20px;
            background: linear-gradient(145deg, #ffa502, #ff6348);
            border-bottom-right-radius: 50%;
            border-top-left-radius: 20px;
            border-top-right-radius: 20px;
            border-bottom-left-radius: 20px;
        }
        
        .simon-button.active {
            transform: scale(0.95);
            box-shadow: 
                0 2px 8px rgba(0, 0, 0, 0.3),
                inset 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .simon-button.flash {
            transform: scale(1.05);
            box-shadow: 
                0 0 30px currentColor,
                0 8px 25px rgba(0, 0, 0, 0.3);
            filter: brightness(1.3) saturate(1.2);
        }
        
        .simon-button-red.flash {
            color: #ff4757;
        }
        
        .simon-button-blue.flash {
            color: #3742fa;
        }
        
        .simon-button-green.flash {
            color: #2ed573;
        }
        
        .simon-button-yellow.flash {
            color: #ffa502;
        }
        
        .simon-controls {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
        }
        
        .simon-start-btn {
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
        
        .simon-start-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        }
        
        .simon-start-btn:active {
            transform: translateY(0);
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }
        
        .simon-start-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        
        .simon-score {
            display: flex;
            gap: 30px;
            font-size: 16px;
            color: var(--vscode-foreground);
        }
        
        .simon-current,
        .simon-best {
            text-align: center;
        }
        
        .simon-current span,
        .simon-best span {
            font-weight: 700;
            color: var(--vscode-textLink-foreground);
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.02); }
        }
        
        .simon-board.thinking {
            animation: pulse 2s infinite;
        }
        
        @media (max-width: 480px) {
            .simon-container {
                margin: 10px;
                padding: 15px;
            }
            
            .simon-board {
                width: 280px;
                height: 280px;
            }
            
            .simon-button {
                width: 120px;
                height: 120px;
            }
            
            .simon-center {
                width: 100px;
                height: 100px;
            }
        }
        `;
    }
    
    getJavaScriptContent(): string {
        return `
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
                const button = document.getElementById(\`simon-\${color}\`);
                
                // Play sound
                try {
                    this.sounds.playTone(color);
                } catch (e) {
                    // Fallback if audio fails
                    console.log(\`Playing \${color}\`);
                }
                
                // Visual feedback
                button.classList.add('flash');
                await this.delay(400);
                button.classList.remove('flash');
            }
            
            async handlePlayerInput(color) {
                if (!this.isPlayerTurn) return;
                
                const button = document.getElementById(\`simon-\${color}\`);
                
                // Visual and audio feedback
                button.classList.add('active');
                try {
                    this.sounds.playTone(color, 200);
                } catch (e) {
                    console.log(\`Player pressed \${color}\`);
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
        `;
    }
}
