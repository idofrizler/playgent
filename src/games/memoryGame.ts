import { CopilotGame } from '../gameInterface';

/**
 * Simple memory card matching game
 */
export class MemoryGame implements CopilotGame {
    id = 'memory-game';
    name = 'Memory Cards';
    description = 'Match pairs of cards to win';
    
    getHtmlContent(): string {
        return `
        <div class="memory-container">
            <div class="memory-stats">
                <div class="memory-score">Moves: <span id="moves">0</span></div>
                <div class="memory-best">Best: <span id="best">0</span></div>
            </div>
            <div class="memory-grid" id="memoryGrid"></div>
            <div class="memory-message" id="memoryMessage">Match all the cards!</div>
        </div>
        `;
    }
    
    getCssContent(): string {
        return `
        .memory-container {
            width: 100%;
            max-width: 500px;
            margin: 0 auto;
        }
        
        .memory-stats {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 18px;
        }
        
        .memory-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin-bottom: 20px;
        }
        
        .memory-card {
            background: var(--vscode-button-background);
            height: 80px;
            border-radius: 5px;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 24px;
            cursor: pointer;
            color: transparent;
            transition: all 0.3s ease;
        }
        
        .memory-card.flipped {
            background: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            border: 1px solid var(--vscode-editor-foreground);
        }
        
        .memory-card.matched {
            background: var(--vscode-button-hoverBackground);
            color: var(--vscode-editor-foreground);
            cursor: default;
        }
        
        .memory-message {
            text-align: center;
            font-size: 20px;
            font-weight: bold;
            color: var(--vscode-editor-foreground);
        }
        
        .game-over {
            font-size: 24px;
            text-align: center;
            color: var(--vscode-editorWarning-foreground);
            margin-top: 20px;
            display: none;
        }
        `;
    }
    
    getJavaScriptContent(): string {
        return `
        const memoryGrid = document.getElementById('memoryGrid');
        const movesDisplay = document.getElementById('moves');
        const bestDisplay = document.getElementById('best');
        const messageDisplay = document.getElementById('memoryMessage');
        
        let cards = [];
        let flippedCards = [];
        let matchedPairs = 0;
        let moves = 0;
        let bestScore = localStorage.getItem('memoryBestScore') || 0;
        let isGameActive = true;
        
        // Set up best score
        bestDisplay.textContent = bestScore;
        
        // Card emojis
        const emojis = ['🚀', '🌟', '🎮', '🎯', '🎨', '🎭', '🎪', '🎢'];
        
        // Initialize the game
        function initGame() {
            // Create pairs of cards
            cards = [...emojis, ...emojis];
            
            // Shuffle cards
            shuffleCards(cards);
            
            // Create card elements
            cards.forEach((emoji, index) => {
                const card = document.createElement('div');
                card.classList.add('memory-card');
                card.dataset.index = index;
                card.dataset.value = emoji;
                card.textContent = emoji;
                
                card.addEventListener('click', () => {
                    if (isGameActive) {
                        flipCard(card);
                    }
                });
                
                memoryGrid.appendChild(card);
            });
        }
        
        // Shuffle cards array
        function shuffleCards(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }
        
        // Flip a card
        function flipCard(card) {
            // Prevent flipping already flipped or matched cards
            if (card.classList.contains('flipped') || 
                card.classList.contains('matched') || 
                flippedCards.length >= 2) {
                return;
            }
            
            // Flip the card
            card.classList.add('flipped');
            flippedCards.push(card);
            
            // Check for matches if two cards are flipped
            if (flippedCards.length === 2) {
                moves++;
                movesDisplay.textContent = moves;
                
                if (flippedCards[0].dataset.value === flippedCards[1].dataset.value) {
                    // Match found
                    flippedCards[0].classList.add('matched');
                    flippedCards[1].classList.add('matched');
                    flippedCards = [];
                    matchedPairs++;
                    
                    // Check if game is complete
                    if (matchedPairs === emojis.length) {
                        handleGameComplete();
                    }
                } else {
                    // Not a match, flip back after delay
                    setTimeout(() => {
                        flippedCards[0].classList.remove('flipped');
                        flippedCards[1].classList.remove('flipped');
                        flippedCards = [];
                    }, 800);
                }
            }
        }
        
        // Handle game completion
        function handleGameComplete() {
            isGameActive = false;
            
            // Update best score
            if (bestScore === 0 || moves < bestScore) {
                bestScore = moves;
                localStorage.setItem('memoryBestScore', bestScore);
                bestDisplay.textContent = bestScore;
                messageDisplay.textContent = 'New Best Score: ' + bestScore + ' moves!';
            } else {
                messageDisplay.textContent = 'You completed in ' + moves + ' moves!';
            }
        }
        
        // Reset the game
        function resetGame() {
            memoryGrid.innerHTML = '';
            flippedCards = [];
            matchedPairs = 0;
            moves = 0;
            movesDisplay.textContent = '0';
            messageDisplay.textContent = 'Match all the cards!';
            isGameActive = true;
            
            initGame();
        }
        
        // Initialize the game
        initGame();
        
        // Handle messages from the extension
        window.addEventListener('message', event => {
            const message = event.data;
            if (message.type === 'stopGame') {
                isGameActive = false;
                
                // Show game over message
                messageDisplay.textContent = 'Game Over - Back to work!';
            }
        });
        `;
    }
}