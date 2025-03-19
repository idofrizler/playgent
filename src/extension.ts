import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

let outputChannel: vscode.OutputChannel;
let statusBarItem: vscode.StatusBarItem;
let logFileWatcher: fs.FSWatcher | undefined;
let lastPosition: number = 0;
let currentLogFile: string | undefined;
let filePollingInterval: NodeJS.Timeout | undefined;
let webviewPanel: vscode.WebviewPanel | undefined;
let timerStarted: boolean = false;
let timerStartTime: number = 0;
let timerInterval: NodeJS.Timeout | undefined;

export function activate(context: vscode.ExtensionContext) {
    // Create output channel
    outputChannel = vscode.window.createOutputChannel('Copilot Monitor');
    outputChannel.show(); // Show the output channel immediately on activation
    
    // Log initial message
    outputChannel.appendLine(`[${new Date().toISOString()}] Copilot Monitor Extension activated`);
    
    // Create status bar item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = "$(copilot) Copilot Chat Monitor";
    statusBarItem.tooltip = "Monitoring Copilot Chat logs";
    statusBarItem.command = 'extension.findCopilotLogs';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);
    
    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('extension.findCopilotLogs', () => {
            findAndMonitorCopilotLogs();
        }),
        vscode.commands.registerCommand('extension.showTimerWebview', () => {
            createOrShowWebviewPanel(context.extensionUri);
        })
    );
    
    // Start monitoring automatically - only once at startup
    findAndMonitorCopilotLogs();
    
    context.subscriptions.push({
        dispose: () => {
            if (filePollingInterval) {
                clearInterval(filePollingInterval);
            }
            if (logFileWatcher) {
                logFileWatcher.close();
            }
            if (timerInterval) {
                clearInterval(timerInterval);
            }
            if (webviewPanel) {
                webviewPanel.dispose();
            }
        }
    });
}

// Create or show the webview panel with a timer
function createOrShowWebviewPanel(extensionUri: vscode.Uri): void {
    if (webviewPanel) {
        // If panel already exists, reveal it
        webviewPanel.reveal(vscode.ViewColumn.One);
    } else {
        // Create a new panel
        webviewPanel = vscode.window.createWebviewPanel(
            'copilotTimer',
            'Copilot Task Timer',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        webviewPanel.webview.html = getWebviewContent(extensionUri);

        // Handle webview panel being closed
        webviewPanel.onDidDispose(() => {
            webviewPanel = undefined;
            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = undefined;
            }
        }, null, []);

        // Handle messages from the webview
        webviewPanel.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case 'resetTimer':
                    resetTimer();
                    break;
                case 'closeWebview':
                    if (webviewPanel) {
                        webviewPanel.dispose();
                        webviewPanel = undefined;
                    }
                    break;
            }
        });
    }

    // Move the active editor to the second column
    vscode.commands.executeCommand('workbench.action.moveEditorToNextGroup');
}

// Get the HTML content for the webview
function getWebviewContent(extensionUri: vscode.Uri): string {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Copilot Fun Game</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                padding: 20px;
                color: var(--vscode-foreground);
                background-color: var(--vscode-editor-background);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }
            .game-container {
                width: 100%;
                max-width: 600px;
                height: 200px;
                border: 1px solid var(--vscode-editor-foreground);
                position: relative;
                overflow: hidden;
                background-color: white;
            }
            .dino {
                width: 40px;
                height: 40px;
                background-color: black;
                position: absolute;
                bottom: 0;
                left: 20px;
            }
            .obstacle {
                width: 20px;
                height: 40px;
                background-color: red;
                position: absolute;
                bottom: 0;
                right: 0;
                animation: moveObstacle 2s linear infinite;
            }
            @keyframes moveObstacle {
                from { right: 0; }
                to { right: 100%; }
            }
            .score {
                position: absolute;
                top: 10px;
                left: 10px;
                font-size: 18px;
                font-weight: bold;
            }
            .top-score {
                position: absolute;
                top: 10px;
                right: 10px;
                font-size: 18px;
                font-weight: bold;
            }
            .final-score {
                display: none;
                font-size: 24px;
                font-weight: bold;
                color: red;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <h1>Copilot Fun Game</h1>
        <div class="game-container" id="gameContainer">
            <div class="dino" id="dino"></div>
            <div class="obstacle" id="obstacle"></div>
            <div class="score" id="score">0</div>
            <div class="top-score" id="topScore">Top Score: 0</div>
        </div>
        <div class="final-score" id="finalScore">Top Score: 0</div>
        <script>
            (function() {
                const dino = document.getElementById('dino');
                const gameContainer = document.getElementById('gameContainer');
                const scoreDisplay = document.getElementById('score');
                const topScoreDisplay = document.getElementById('topScore');
                const finalScoreDisplay = document.getElementById('finalScore');
                let isJumping = false;
                let gravity = 0.9;
                let score = 0;
                let topScore = 0;
                let gameInterval;

                // Load top score from local storage
                if (localStorage.getItem('topScore')) {
                    topScore = parseInt(localStorage.getItem('topScore'));
                    topScoreDisplay.textContent = 'Top Score: ' + topScore;
                }

                document.addEventListener('keydown', function(event) {
                    if (event.code === 'Space' && !isJumping) {
                        jump();
                    }
                });

                function jump() {
                    let position = 0;
                    isJumping = true;

                    let upInterval = setInterval(() => {
                        if (position >= 150) {
                            clearInterval(upInterval);

                            let downInterval = setInterval(() => {
                                if (position <= 0) {
                                    clearInterval(downInterval);
                                    isJumping = false;
                                }
                                position -= 5;
                                position = position * gravity;
                                dino.style.bottom = position + 'px';
                            }, 20);
                        }
                        position += 30;
                        dino.style.bottom = position + 'px';
                    }, 20);
                }

                function checkCollision() {
                    const dinoRect = dino.getBoundingClientRect();
                    const obstacleRect = document.getElementById('obstacle').getBoundingClientRect();

                    if (
                        dinoRect.right > obstacleRect.left &&
                        dinoRect.left < obstacleRect.right &&
                        dinoRect.bottom > obstacleRect.top
                    ) {
                        resetGame();
                    }
                }

                function resetGame() {
                    if (score > topScore) {
                        topScore = score;
                        localStorage.setItem('topScore', topScore);
                        topScoreDisplay.textContent = 'Top Score: ' + topScore;
                    }
                    score = 0;
                    scoreDisplay.textContent = score;
                    dino.style.bottom = '0px';
                    isJumping = false;
                }

                function updateScore() {
                    score++;
                    scoreDisplay.textContent = score;
                }

                gameInterval = setInterval(() => {
                    checkCollision();
                    updateScore();
                }, 100);

                window.addEventListener('message', event => {
                    const message = event.data;
                    if (message.type === 'stopGame') {
                        clearInterval(gameInterval);
                        topScoreDisplay.textContent = 'Top Score: ' + topScore;
                        gameContainer.style.display = 'none';
                        finalScoreDisplay.textContent = 'Top Score: ' + topScore;
                        finalScoreDisplay.style.display = 'block';
                        setTimeout(() => {
                            const vscode = acquireVsCodeApi();
                            vscode.postMessage({ command: 'closeWebview' });
                        }, 2000);
                    }
                });
            })();
        </script>
    </body>
    </html>`;
}

// Start the timer and update the webview
function startTimer(): void {
    if (timerStarted) {
        return; // Don't start if already running
    }

    timerStarted = true;
    timerStartTime = Date.now();
    outputChannel.appendLine(`[${new Date().toISOString()}] Tool call detected, starting timer`);
    
    // Create webview if it doesn't exist
    if (!webviewPanel) {
        createOrShowWebviewPanel(vscode.Uri.file(path.dirname(path.dirname(__filename))));
    }
    
    // Update webview with initial state
    updateWebviewTimer('Timer started: tool call detected');
    
    // Start timer interval
    timerInterval = setInterval(() => {
        updateWebviewTimer('Timer running: waiting for completion');
    }, 1000);
}

// Stop the timer and update the webview
function stopTimer(): void {
    if (!timerStarted) {
        return; // Don't stop if not running
    }
    
    timerStarted = false;
    outputChannel.appendLine(`[${new Date().toISOString()}] Stop message detected, stopping timer`);
    
    // Update webview with final time
    if (webviewPanel) {
        webviewPanel.webview.postMessage({ 
            type: 'stopGame'
        });
    }
    
    // Clear the interval
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = undefined;
    }
}

// Reset timer to initial state
function resetTimer(): void {
    timerStarted = false;
    timerStartTime = 0;
    
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = undefined;
    }
    
    if (webviewPanel) {
        updateWebviewTimer('Timer reset, waiting for new activity');
    }
    
    outputChannel.appendLine(`[${new Date().toISOString()}] Timer reset`);
}

// Update the webview with the current timer value
function updateWebviewTimer(statusText: string): void {
    if (webviewPanel) {
        const elapsedMs = timerStarted ? (Date.now() - timerStartTime) : 0;
        const minutes = Math.floor(elapsedMs / 60000).toString().padStart(2, '0');
        const seconds = Math.floor((elapsedMs % 60000) / 1000).toString().padStart(2, '0');
        
        webviewPanel.webview.postMessage({ 
            type: 'update',
            time: `${minutes}:${seconds}`,
            status: statusText
        });
    }
}

/**
 * Find and start monitoring the Copilot Chat log files
 */
async function findAndMonitorCopilotLogs(): Promise<void> {
    try {
        // Only search for the log file if we don't already have one
        if (!currentLogFile) {
            const logFile = await findLatestCopilotLogFile();
            
            if (!logFile) {
                outputChannel.appendLine(`[${new Date().toISOString()}] No Copilot Chat log files found`);
                statusBarItem.text = "$(copilot) No logs found";
                return;
            }
            
            currentLogFile = logFile;
            outputChannel.appendLine(`[${new Date().toISOString()}] Found Copilot Chat log file: ${logFile}`);
            statusBarItem.text = "$(copilot) Monitoring logs";
            
            // Initial read of the log file
            readLogFile(logFile);
        }
        
        // Set up watcher if not already watching this file
        if (!logFileWatcher && currentLogFile) {
            try {
                // Use fs.watch for immediate notification of changes
                logFileWatcher = fs.watch(currentLogFile, (eventType) => {
                    if (eventType === 'change' && currentLogFile) {
                        readLogFile(currentLogFile);
                    }
                });
                
                // Some systems might not reliably trigger fs.watch events
                // So we also poll the file regularly as a backup
                if (!filePollingInterval) {
                    filePollingInterval = setInterval(() => {
                        if (currentLogFile) {
                            readLogFile(currentLogFile);
                        }
                    }, 1000); // Check every second as requested
                }
                
                outputChannel.appendLine(`[${new Date().toISOString()}] Started monitoring log file for changes`);
            } catch (error) {
                outputChannel.appendLine(`[${new Date().toISOString()}] Error setting up file watcher: ${error}`);
                
                // Fall back to polling only if watching fails
                if (!filePollingInterval) {
                    filePollingInterval = setInterval(() => {
                        if (currentLogFile) {
                            readLogFile(currentLogFile);
                        }
                    }, 1000);
                    outputChannel.appendLine(`[${new Date().toISOString()}] Falling back to polling-based monitoring`);
                }
            }
        }
    } catch (error) {
        outputChannel.appendLine(`[${new Date().toISOString()}] Error finding logs: ${error}`);
        statusBarItem.text = "$(copilot) Error finding logs";
    }
}

/**
 * Find the latest Copilot Chat log file
 */
async function findLatestCopilotLogFile(): Promise<string | undefined> {
    try {
        // Get the VS Code logs directory
        const appDataDir = process.env.APPDATA || (process.platform === 'darwin' ? 
            path.join(os.homedir(), 'Library', 'Application Support') : 
            path.join(os.homedir(), '.config'));
            
        // Determine if this is VS Code or VS Code Insiders
        const isInsiders = vscode.env.appName.includes('Insiders');
        const baseLogDir = path.join(appDataDir, isInsiders ? 'Code - Insiders' : 'Code', 'logs');
        
        // Find all date-based directories in the logs folder
        const dateDirs = await fs.promises.readdir(baseLogDir);
        
        // Sort directories by creation time (newest first)
        const sortedDirs = dateDirs
            .filter(dir => dir.match(/^\d{8}T\d{6}$/)) // Filter for date pattern like 20250319T171247
            .sort()
            .reverse();
        
        if (sortedDirs.length === 0) {
            return undefined;
        }

        // For each date directory, look for window*/exthost/GitHub.copilot-chat directories
        for (const dateDir of sortedDirs) {
            const dateDirPath = path.join(baseLogDir, dateDir);
            
            // Get window directories and their stats
            const windowDirs = await fs.promises.readdir(dateDirPath);
            const windowDirsFiltered = windowDirs.filter(dir => dir.startsWith('window'));
            
            if (windowDirsFiltered.length === 0) {
                continue;
            }
            
            // Get stats for each window directory to find the latest one
            const windowDirStats = await Promise.all(
                windowDirsFiltered.map(async (dir) => {
                    const fullPath = path.join(dateDirPath, dir);
                    try {
                        const stats = await fs.promises.stat(fullPath);
                        return {
                            name: dir,
                            path: fullPath,
                            mtime: stats.mtime,
                            extHostPath: path.join(fullPath, 'exthost', 'GitHub.copilot-chat')
                        };
                    } catch (error) {
                        return null;
                    }
                })
            );
            
            // Filter out any null entries and sort by modification time (newest first)
            const validWindowDirs = windowDirStats
                .filter(item => item !== null)
                .sort((a, b) => b!.mtime.getTime() - a!.mtime.getTime());
                
            outputChannel.appendLine(`[${new Date().toISOString()}] Found ${validWindowDirs.length} window directories in ${dateDir}`);
            
            // Check each window directory in order (newest first)
            for (const windowDir of validWindowDirs) {
                if (!windowDir) continue;
                
                try {
                    // Check if the GitHub.copilot-chat directory exists
                    if (await pathExists(windowDir.extHostPath)) {
                        const files = await fs.promises.readdir(windowDir.extHostPath);
                        const logFile = files.find(file => file.endsWith('.log'));
                        
                        if (logFile) {
                            const logFilePath = path.join(windowDir.extHostPath, logFile);
                            outputChannel.appendLine(`[${new Date().toISOString()}] Found log file in window directory: ${windowDir.name}`);
                            return logFilePath;
                        }
                    }
                } catch (error) {
                    // Continue to next window directory if there's an error
                    continue;
                }
            }
        }
        
        return undefined;
    } catch (error) {
        outputChannel.appendLine(`[${new Date().toISOString()}] Error searching for log files: ${error}`);
        return undefined;
    }
}

/**
 * Read the log file and output new content
 */
function readLogFile(filePath: string): void {
    try {
        const stats = fs.statSync(filePath);
        
        // If the file doesn't exist or we can't read it, return
        if (!stats || !stats.isFile()) {
            return;
        }
        
        // If the file size is smaller than our last position, 
        // the file might have been truncated/rotated
        if (stats.size < lastPosition) {
            outputChannel.appendLine(`[${new Date().toISOString()}] Log file appears to have been truncated, resetting position`);
            lastPosition = 0;
        }
        
        // If nothing new to read, don't continue
        if (stats.size <= lastPosition) {
            return;
        }
        
        // Read only the new content since last read
        const buffer = Buffer.alloc(stats.size - lastPosition);
        const fileDescriptor = fs.openSync(filePath, 'r');
        
        fs.readSync(fileDescriptor, buffer, 0, buffer.length, lastPosition);
        fs.closeSync(fileDescriptor);
        
        // Update last position
        const oldPosition = lastPosition;
        lastPosition = stats.size;
        
        // Debugging info
        // outputChannel.appendLine(`[${new Date().toISOString()}] Reading ${buffer.length} bytes from position ${oldPosition} to ${lastPosition}`);
        
        // Convert buffer to string and process content
        const content = buffer.toString('utf8');
        if (content.trim()) {
            processLogContent(content);
        }
    } catch (error) {
        outputChannel.appendLine(`[${new Date().toISOString()}] Error reading log file: ${error}`);
    }
}

/**
 * Process and filter log content
 */
function processLogContent(content: string): void {
    // Split content into lines
    const lines = content.split(/\r?\n/);
    let foundInteresting = false;
    
    for (const line of lines) {
        if (!line.trim()) {
            continue;
        }
                
        // Look for timer start/stop messages
        if (line.includes('message 0 returned. finish reason: [tool_calls]')) {
            startTimer();
        } else if (line.includes('message 0 returned. finish reason: [stop]') && timerStarted) {
            stopTimer();
        }
        
        // Filter for interesting log entries
        // Modify these filters based on what you want to see
        if (
            line.includes('copilot') || 
            line.includes('chat') || 
            line.includes('completion') ||
            line.includes('request') ||
            line.includes('response')
        ) {
            outputChannel.appendLine(line);
            foundInteresting = true;
        }
    }
    
    if (foundInteresting) {
        // Update status bar with recent activity
        statusBarItem.text = "$(copilot) Activity detected";
        setTimeout(() => {
            statusBarItem.text = "$(copilot) Monitoring logs";
        }, 3000);
    }
}

/**
 * Check if a path exists
 */
async function pathExists(p: string): Promise<boolean> {
    try {
        await fs.promises.access(p);
        return true;
    } catch {
        return false;
    }
}

export function deactivate() {
    if (logFileWatcher) {
        logFileWatcher.close();
    }
    
    if (filePollingInterval) {
        clearInterval(filePollingInterval);
    }
    
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    if (outputChannel) {
        outputChannel.dispose();
    }
    
    if (statusBarItem) {
        statusBarItem.dispose();
    }
    
    if (webviewPanel) {
        webviewPanel.dispose();
    }
}
