import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { CopilotGame, GameRegistry } from './gameInterface';
import { DinoGame } from './games/dinoGame';
import { MemoryGame } from './games/memoryGame';
import { XkcdGame } from './games/xkcdGame';

// Extension state
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
let currentGame: CopilotGame | undefined;

// Config settings
const CONFIG_SECTION = 'playgent';

// Register games
function registerGames() {
    GameRegistry.registerGame(new DinoGame());
    GameRegistry.registerGame(new MemoryGame());
    GameRegistry.registerGame(new XkcdGame());
    // Add new games here
}

export function activate(context: vscode.ExtensionContext) {
    // Register games
    registerGames();
    
    // Create output channel
    outputChannel = vscode.window.createOutputChannel('Playgent');
    
    // Log initial message
    outputChannel.appendLine(`[${new Date().toISOString()}] Playgent Extension activated`);
    
    // Create status bar item with icon
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = "$(gamepad) Playgent";
    statusBarItem.tooltip = "Playgent: Take a break while waiting for Copilot";
    statusBarItem.command = 'playgent.showGame';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);
    
    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('playgent.findLogs', () => {
            findAndMonitorCopilotLogs();
            // Show notification to user
            vscode.window.showInformationMessage('Playgent is now monitoring Copilot activity');
        }),
        vscode.commands.registerCommand('playgent.showGame', () => {
            createOrShowWebviewPanel(context.extensionUri);
        }),
        vscode.commands.registerCommand('playgent.selectGame', async () => {
            await selectGame(context.extensionUri);
        })
    );
    
    // Get configuration
    const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
    
    // Start monitoring automatically if enabled
    if (config.get<boolean>('autoStartMonitoring', true)) {
        findAndMonitorCopilotLogs();
    }
    
    // Set default game if configured
    const defaultGameId = config.get<string>('defaultGame', 'dino-game');
    if (defaultGameId) {
        const game = GameRegistry.getGame(defaultGameId);
        if (game) {
            currentGame = game;
        }
    }
    
    // Listen for configuration changes
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration(`${CONFIG_SECTION}.autoStartMonitoring`)) {
                const newConfig = vscode.workspace.getConfiguration(CONFIG_SECTION);
                if (newConfig.get<boolean>('autoStartMonitoring', true)) {
                    findAndMonitorCopilotLogs();
                } else {
                    stopMonitoring();
                }
            }
            
            if (e.affectsConfiguration(`${CONFIG_SECTION}.defaultGame`)) {
                const newConfig = vscode.workspace.getConfiguration(CONFIG_SECTION);
                const defaultGameId = newConfig.get<string>('defaultGame', 'dino-game');
                if (defaultGameId) {
                    const game = GameRegistry.getGame(defaultGameId);
                    if (game && (!currentGame || webviewPanel === undefined)) {
                        currentGame = game;
                    }
                }
            }
        })
    );
    
    context.subscriptions.push({
        dispose: () => {
            stopMonitoring();
            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = undefined;
            }
            if (webviewPanel) {
                webviewPanel.dispose();
                webviewPanel = undefined;
            }
        }
    });
}

// Stop monitoring logs
function stopMonitoring(): void {
    if (filePollingInterval) {
        clearInterval(filePollingInterval);
        filePollingInterval = undefined;
    }
    if (logFileWatcher) {
        logFileWatcher.close();
        logFileWatcher = undefined;
    }
    
    statusBarItem.text = "$(gamepad) Playgent";
    statusBarItem.tooltip = "Playgent: Take a break while waiting for Copilot";
    
    outputChannel.appendLine(`[${new Date().toISOString()}] Stopped monitoring Copilot logs`);
}

/**
 * Select a game from the list of available games
 */
async function selectGame(extensionUri: vscode.Uri): Promise<void> {
    const games = GameRegistry.getAllGames();
    
    if (games.length === 0) {
        vscode.window.showInformationMessage('No games are registered');
        return;
    }
    
    const gameItems = games.map(game => ({
        label: game.name,
        description: game.description,
        iconPath: new vscode.ThemeIcon('gamepad'),
        game: game
    }));
    
    const selectedItem = await vscode.window.showQuickPick(gameItems, {
        placeHolder: 'Select a game to play',
        title: 'Playgent Games'
    });
    
    if (selectedItem) {
        currentGame = selectedItem.game;
        if (webviewPanel) {
            webviewPanel.dispose(); // Close the current panel
            webviewPanel = undefined;
        }
        createOrShowWebviewPanel(extensionUri); // Create a new panel with the selected game
        
        // Save as default game if the user wants
        const saveAsDefault = await vscode.window.showInformationMessage(
            `Do you want to set ${selectedItem.game.name} as your default game?`,
            'Yes', 'No'
        );
        
        if (saveAsDefault === 'Yes') {
            const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
            await config.update('defaultGame', selectedItem.game.id, vscode.ConfigurationTarget.Global);
        }
    }
}

// Create or show the webview panel with the current game
function createOrShowWebviewPanel(extensionUri: vscode.Uri): void {
    if (!currentGame) {
        currentGame = GameRegistry.getDefaultGame();
        if (!currentGame) {
            vscode.window.showErrorMessage('No games available');
            return;
        }
    }

    if (webviewPanel) {
        // If panel already exists, reveal it
        webviewPanel.reveal(vscode.ViewColumn.One);
    } else {
        // Create a new panel
        webviewPanel = vscode.window.createWebviewPanel(
            'playgentGame',
            `Playgent: ${currentGame.name}`,
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [extensionUri]
            }
        );

        webviewPanel.iconPath = {
            light: vscode.Uri.joinPath(extensionUri, 'resources', 'light', 'gamepad.svg'),
            dark: vscode.Uri.joinPath(extensionUri, 'resources', 'dark', 'gamepad.svg')
        };
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
                case 'changeGame':
                    selectGame(extensionUri);
                    break;
            }
        });
    }

    // Move the active editor to the second column
    vscode.commands.executeCommand('workbench.action.moveEditorToNextGroup');
}

// Get the HTML content for the webview
function getWebviewContent(extensionUri: vscode.Uri): string {
    if (!currentGame) {
        currentGame = GameRegistry.getDefaultGame();
        if (!currentGame) {
            return `<html><body>No games available</body></html>`;
        }
    }

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Playgent: ${currentGame.name}</title>
        <style>
            :root {
                --container-padding: 20px;
                --base-font-size: 14px;
            }

            body {
                font-family: var(--vscode-font-family);
                font-size: var(--base-font-size);
                padding: 0;
                margin: 0;
                color: var(--vscode-foreground);
                background-color: var(--vscode-editor-background);
            }

            .header {
                background-color: var(--vscode-editor-inactiveSelectionBackground);
                padding: 10px var(--container-padding);
                border-bottom: 1px solid var(--vscode-panel-border);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .header-left {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .logo {
                font-size: 18px;
                font-weight: bold;
                color: var(--vscode-activityBar-activeBorder);
            }

            .game-title {
                font-size: 16px;
                font-weight: bold;
            }

            .header-right {
                display: flex;
                gap: 10px;
            }

            .content {
                padding: var(--container-padding);
                display: flex;
                flex-direction: column;
                align-items: center;
            }

            .action-button {
                background-color: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
                border: none;
                padding: 6px 12px;
                cursor: pointer;
                border-radius: 2px;
                font-family: var(--vscode-font-family);
                font-size: var(--base-font-size);
                display: flex;
                align-items: center;
                gap: 5px;
                transition: background-color 0.2s;
            }

            .action-button:hover {
                background-color: var(--vscode-button-hoverBackground);
            }

            .action-button:focus {
                outline: 1px solid var(--vscode-focusBorder);
            }

            .game-container {
                margin-top: 10px;
                width: 100%;
            }

            .footer {
                margin-top: 20px;
                text-align: center;
                font-size: 12px;
                color: var(--vscode-descriptionForeground);
                padding: 10px;
                border-top: 1px solid var(--vscode-panel-border);
            }

            ${currentGame.getCssContent()}
        </style>
    </head>
    <body>
        <div class="header">
            <div class="header-left">
                <div class="logo">Playgent</div>
                <div class="game-title">${currentGame.name}</div>
            </div>
            <div class="header-right">
                <button class="action-button" id="changeGameBtn">
                    <span>Change Game</span>
                </button>
            </div>
        </div>
        <div class="content">
            <div class="game-container">
                ${currentGame.getHtmlContent()}
            </div>
        </div>
        <div class="footer">
            Playgent - Take breaks while waiting for Copilot
        </div>
        
        <script>
            (function() {
                const vscode = acquireVsCodeApi();
                
                // Setup change game button
                document.getElementById('changeGameBtn').addEventListener('click', () => {
                    vscode.postMessage({ command: 'changeGame' });
                });
                
                // Game specific JavaScript
                ${currentGame.getJavaScriptContent()}
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
    
    // Update status bar
    statusBarItem.text = "$(gamepad) Playgent $(loading~spin)";
    statusBarItem.tooltip = "Playgent: Copilot activity in progress";
    
    // Create webview if it doesn't exist
    if (!webviewPanel) {
        createOrShowWebviewPanel(vscode.Uri.file(path.dirname(path.dirname(__filename))));
    }
    
    // Start timer interval
    timerInterval = setInterval(() => {
        updateStatusBar();
    }, 1000);
}

// Update status bar with animation
function updateStatusBar(): void {
    const elapsedMs = Date.now() - timerStartTime;
    const seconds = Math.floor(elapsedMs / 1000);
    
    // Alternate animation states
    if (seconds % 2 === 0) {
        statusBarItem.text = "$(gamepad) Playgent $(loading~spin)";
    } else {
        statusBarItem.text = "$(play) Playgent $(loading~spin)";
    }
}

// Stop the timer and update the webview
function stopTimer(): void {
    if (!timerStarted) {
        return; // Don't stop if not running
    }
    
    timerStarted = false;
    outputChannel.appendLine(`[${new Date().toISOString()}] Stop message detected, stopping timer`);
    
    // Reset status bar
    statusBarItem.text = "$(gamepad) Playgent";
    statusBarItem.tooltip = "Playgent: Take a break while waiting for Copilot";
    
    // Update webview with final time
    if (webviewPanel) {
        webviewPanel.webview.postMessage({ 
            type: 'stopGame'
        });
        
        // Schedule webview to close after allowing time for the game to show the final score
        setTimeout(() => {
            if (webviewPanel) {
                webviewPanel.dispose();
                webviewPanel = undefined;
            }
        }, 2000);
    }
    
    // Clear the interval
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = undefined;
    }
    
    // Show toast notification
    vscode.window.showInformationMessage('Copilot has completed its task!');
}

// Reset timer to initial state
function resetTimer(): void {
    timerStarted = false;
    timerStartTime = 0;
    
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = undefined;
    }
    
    // Reset status bar
    statusBarItem.text = "$(gamepad) Playgent";
    statusBarItem.tooltip = "Playgent: Take a break while waiting for Copilot";
    
    outputChannel.appendLine(`[${new Date().toISOString()}] Timer reset`);
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
                statusBarItem.text = "$(gamepad) Playgent";
                statusBarItem.tooltip = "Playgent: No Copilot logs found";
                vscode.window.showWarningMessage('Playgent could not find Copilot log files');
                return;
            }
            
            currentLogFile = logFile;
            outputChannel.appendLine(`[${new Date().toISOString()}] Found Copilot Chat log file: ${logFile}`);
            statusBarItem.text = "$(gamepad) Playgent";
            statusBarItem.tooltip = "Playgent: Monitoring Copilot activity";
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
                    }, 1000); // Check every second
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
        statusBarItem.text = "$(gamepad) Playgent (!!)";
        statusBarItem.tooltip = "Playgent: Error finding logs";
        vscode.window.showErrorMessage('Playgent encountered an error while finding Copilot logs');
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
        lastPosition = stats.size;
        
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
    
    if (foundInteresting && !timerStarted) {
        // Update status bar with recent activity
        const currentText = statusBarItem.text;
        statusBarItem.text = "$(gamepad) Playgent $(check)";
        statusBarItem.tooltip = "Playgent: Copilot activity detected";
        
        // Reset back after a short delay
        setTimeout(() => {
            statusBarItem.text = "$(gamepad) Playgent";
            statusBarItem.tooltip = "Playgent: Monitoring Copilot activity";
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
    stopMonitoring();
    
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
