import { CopilotGame } from '../gameInterface';

/**
 * XKCD Comic Viewer - Display random XKCD comics
 */
export class XkcdGame implements CopilotGame {
    id = 'xkcd-game';
    name = 'XKCD Comics';
    description = 'View random XKCD comics';
    
    getHtmlContent(): string {
        return `
        <div class="xkcd-container">
            <div class="comic-display">
                <div class="comic-title" id="comicTitle">Loading comic...</div>
                <div class="comic-image-container">
                    <img id="comicImage" alt="XKCD Comic" class="comic-image">
                </div>
                <div class="comic-alt" id="comicAlt"></div>
                <div class="comic-number" id="comicNumber"></div>
            </div>
            <div class="comic-controls">
                <button id="loadNewComic" class="comic-button">Load Another Comic</button>
            </div>
            <div class="loading-spinner" id="loadingSpinner">
                <div class="spinner"></div>
            </div>
        </div>
        `;
    }
    
    getCssContent(): string {
        return `
        .xkcd-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: var(--vscode-editor-background);
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .comic-display {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .comic-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 15px;
            text-align: center;
            color: var(--vscode-foreground);
        }
        
        .comic-image-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 300px;
            margin-bottom: 15px;
            width: 100%;
        }
        
        .comic-image {
            max-width: 100%;
            max-height: 500px;
            border: 2px solid var(--vscode-editor-lineHighlightBorder);
            border-radius: 4px;
        }
        
        .hidden {
            visibility: hidden;
        }
        
        .comic-alt {
            font-style: italic;
            margin: 10px 0;
            padding: 10px;
            background-color: var(--vscode-editor-inactiveSelectionBackground);
            border-radius: 4px;
            color: var(--vscode-foreground);
            max-width: 600px;
            text-align: center;
        }
        
        .comic-number {
            font-size: 14px;
            color: var(--vscode-descriptionForeground);
            margin-top: 5px;
        }
        
        .comic-controls {
            display: flex;
            justify-content: center;
            margin-top: 20px;
        }
        
        .comic-button {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            font-size: 16px;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        
        .comic-button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        
        .loading-spinner {
            display: none;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
        
        .loading-spinner.visible {
            display: block;
        }
        
        .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top: 4px solid var(--vscode-button-background);
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* Responsive adjustments */
        @media (max-width: 600px) {
            .comic-title {
                font-size: 20px;
            }
            
            .comic-image {
                max-height: 400px;
            }
        }
        `;
    }
    
    getJavaScriptContent(): string {
        return `
        // Elements
        const comicTitle = document.getElementById('comicTitle');
        const comicImage = document.getElementById('comicImage');
        const comicAlt = document.getElementById('comicAlt');
        const comicNumber = document.getElementById('comicNumber');
        const loadButton = document.getElementById('loadNewComic');
        const loadingSpinner = document.getElementById('loadingSpinner');
        
        // CORS proxy to avoid cross-origin issues in the webview
        const corsProxy = 'https://api.allorigins.win/raw?url=';
        
        // Current comic number (for XKCD API)
        let currentComicNumber = null;
        
        // Hide elements before loading
        function hideElementsBeforeLoad() {
            comicImage.classList.add('hidden');
            comicAlt.classList.add('hidden');
            comicNumber.classList.add('hidden');
        }
        
        // Load a random XKCD comic
        async function loadRandomComic() {
            try {
                showLoading(true);
                
                // First fetch the latest comic number
                const latestResponse = await fetch(corsProxy + 'https://xkcd.com/info.0.json');
                const latestData = await latestResponse.json();
                const maxComicNumber = latestData.num;
                
                // Generate a random comic number between 1 and max
                const randomComicNumber = Math.floor(Math.random() * maxComicNumber) + 1;
                
                // Fetch the random comic
                const response = await fetch(corsProxy + 'https://xkcd.com/' + randomComicNumber + '/info.0.json');
                const data = await response.json();
                
                // Display the comic
                displayComic(data);
                
                // Store the current comic number
                currentComicNumber = data.num;
            } catch (error) {
                console.error('Error loading XKCD comic:', error);
                comicTitle.textContent = 'Error loading comic';
                comicAlt.textContent = 'Failed to load comic. Please try again.';
            } finally {
                showLoading(false);
            }
        }
        
        // Display a comic from the data
        function displayComic(comicData) {
            comicTitle.textContent = comicData.title;
            comicImage.src = comicData.img;
            comicImage.alt = comicData.alt;
            comicAlt.textContent = comicData.alt;
            comicNumber.textContent = 'Comic #' + comicData.num;
            
            // Show elements once loaded
            comicImage.classList.remove('hidden');
            comicAlt.classList.remove('hidden');
            comicNumber.classList.remove('hidden');
        }
        
        // Show or hide loading spinner
        function showLoading(isLoading) {
            if (isLoading) {
                loadingSpinner.style.display = 'block';
                comicTitle.textContent = 'Loading comic...';
                loadButton.disabled = true;
            } else {
                loadingSpinner.style.display = 'none';
                loadButton.disabled = false;
            }
        }
        
        // Handle errors with the comic image
        comicImage.onerror = function() {
            comicImage.src = '';
            comicImage.alt = 'Failed to load image';
            comicAlt.textContent = 'Image failed to load. This might be due to CORS restrictions. Please try another comic.';
        };
        
        // Add event listener to the load button
        loadButton.addEventListener('click', () => {
            loadRandomComic();
        });
        
        // Load a random comic when the page loads
        window.addEventListener('load', () => {
            hideElementsBeforeLoad();
            loadRandomComic();
        });
        `;
    }
}