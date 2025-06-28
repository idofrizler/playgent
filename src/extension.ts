import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { CopilotGame, GameRegistry } from './gameInterface';
import { MemoryGame } from './games/memoryGame';
import { XkcdGame } from './games/xkcdGame';
import { SimonGame } from './games/simonGame';
import { BreakoutGame } from './games/breakoutGame';
import { NeonSnakeGame } from './games/neonSnakeGame';
import { WhackAMoleGame } from './games/whackAMoleGame';

// Extension state
let outputChannel: vscode.OutputChannel;
let statusBarItem: vscode.StatusBarItem;
let logFileWatchers: Map<string, fs.FSWatcher> = new Map();
let logFilePositions: Map<string, number> = new Map();
let activeLogFiles: string[] = [];
let filePollingInterval: NodeJS.Timeout | undefined;
let webviewPanel: vscode.WebviewPanel | undefined;
let timerStarted: boolean = false;
let timerStartTime: number = 0;
let timerInterval: NodeJS.Timeout | undefined;
let currentGame: CopilotGame | undefined;
let extensionUri: vscode.Uri; // Store extension URI globally

// Enhanced logging for debugging
interface LogFileInfo {
    path: string;
    windowId: string;
    lastActivity: Date;
    isActive: boolean;
}

// Config settings
const CONFIG_SECTION = 'playgent';

// Register games
function registerGames() {
    GameRegistry.registerGame(new MemoryGame());
    GameRegistry.registerGame(new XkcdGame());
    GameRegistry.registerGame(new SimonGame());
    GameRegistry.registerGame(new BreakoutGame());
    GameRegistry.registerGame(new NeonSnakeGame());
    GameRegistry.registerGame(new WhackAMoleGame());
    // Add new games here
}

export function activate(context: vscode.ExtensionContext) {
    // Store extension URI globally
    extensionUri = context.extensionUri;
    
    // Register games
    registerGames();
      // Create output channel
    outputChannel = vscode.window.createOutputChannel('Playgent');
    
    // Show the output channel by default for debugging
    outputChannel.show();
    
    // Log initial message
    outputChannel.appendLine(`[${new Date().toISOString()}] Playgent Extension activated`);
    outputChannel.appendLine(`[${new Date().toISOString()}] Extension will show monitoring status automatically`);
    
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
        }),
        vscode.commands.registerCommand('playgent.showMonitoringStatus', () => {
            showMonitoringStatus();
        })
    );
      // Get configuration
    const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
      // Start monitoring automatically if enabled
    if (config.get<boolean>('autoStartMonitoring', true)) {
        findAndMonitorCopilotLogs();
        
        // Show monitoring status after a brief delay to let monitoring start
        setTimeout(() => {
            showMonitoringStatus();
        }, 2000);
    } else {
        outputChannel.appendLine(`[${new Date().toISOString()}] Auto-monitoring is disabled in settings`);
    }
    
    // Don't set a default game - we'll pick random games each time
    
    // Listen for configuration changes
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration(`${CONFIG_SECTION}.autoStartMonitoring`)) {
                const newConfig = vscode.workspace.getConfiguration(CONFIG_SECTION);
                if (newConfig.get<boolean>('autoStartMonitoring', true)) {                    findAndMonitorCopilotLogs();
                } else {
                    stopMonitoring();
                }
            }
            
            // Remove default game configuration - we now use random games
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
    
    // Close all file watchers
    logFileWatchers.forEach((watcher, filePath) => {
        outputChannel.appendLine(`[${new Date().toISOString()}] Stopping monitor for: ${filePath}`);
        watcher.close();
    });
    logFileWatchers.clear();
    logFilePositions.clear();
    activeLogFiles = [];
    
    statusBarItem.text = "$(gamepad) Playgent";
    statusBarItem.tooltip = "Playgent: Take a break while waiting for Copilot";
    
    outputChannel.appendLine(`[${new Date().toISOString()}] Stopped monitoring all Copilot logs`);
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
    if (webviewPanel) {
        // If panel already exists, just reveal it - don't change the game
        outputChannel.appendLine(`[${new Date().toISOString()}] 👁️ Revealing existing webview panel (keeping current game: ${currentGame?.name || 'unknown'})`);
        webviewPanel.reveal(vscode.ViewColumn.One);
        return;
    }    // Only pick a random game when creating a new panel and no game is already selected
    if (!currentGame) {
        currentGame = GameRegistry.getRandomGame();
        if (!currentGame) {
            currentGame = GameRegistry.getDefaultGame();
            if (!currentGame) {
                vscode.window.showErrorMessage('No games available');
                return;
            }
        }
        outputChannel.appendLine(`[${new Date().toISOString()}] 🎲 Selected random game: ${currentGame.name}`);
    } else {
        outputChannel.appendLine(`[${new Date().toISOString()}] 🎯 Using pre-selected game: ${currentGame.name}`);
    }    // Create a new panel
    outputChannel.appendLine(`[${new Date().toISOString()}] 🆕 Creating new webview panel for ${currentGame.name}`);
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
        outputChannel.appendLine(`[${new Date().toISOString()}] 🗑️ Webview panel disposed`);
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

    outputChannel.appendLine(`[${new Date().toISOString()}] ✅ Webview panel created successfully`);

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

// Start the timer and open the game window
function startTimer(): void {
    if (timerStarted) {
        // If timer is already started, just ensure the game window is open
        if (!webviewPanel) {
            outputChannel.appendLine(`[${new Date().toISOString()}] 📱 Timer running but window was closed, reopening game window`);
            createOrShowWebviewPanel(extensionUri);
        } else {
            outputChannel.appendLine(`[${new Date().toISOString()}] ⚠️ Timer already started, game window already open - revealing it`);
            webviewPanel.reveal(vscode.ViewColumn.One);
        }
        return;
    }

    timerStarted = true;
    timerStartTime = Date.now();
    outputChannel.appendLine(`[${new Date().toISOString()}] 🎮 Tool call detected - Starting timer and opening game window`);
    
    // Update status bar
    statusBarItem.text = "$(gamepad) Playgent $(loading~spin)";
    statusBarItem.tooltip = "Playgent: Copilot activity in progress - Game window opening";
    
    // Always create/open the game window on first tool_calls
    outputChannel.appendLine(`[${new Date().toISOString()}] � Opening Playgent game window (webviewPanel exists: ${!!webviewPanel})`);
    createOrShowWebviewPanel(extensionUri);
    
    // Start timer interval for status bar animation
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
 * Find and start monitoring ALL Copilot Chat log files
 */
async function findAndMonitorCopilotLogs(): Promise<void> {
    outputChannel.appendLine(`[${new Date().toISOString()}] 🔍 Starting search for Copilot Chat log files...`);
    
    try {
        const logFiles = await findAllCopilotLogFiles();
        
        if (logFiles.length === 0) {
            outputChannel.appendLine(`[${new Date().toISOString()}] ❌ No Copilot Chat log files found`);
            outputChannel.appendLine(`[${new Date().toISOString()}] Make sure GitHub Copilot is installed and you've used Copilot Chat recently`);
            statusBarItem.text = "$(gamepad) Playgent";
            statusBarItem.tooltip = "Playgent: No Copilot logs found";
            vscode.window.showWarningMessage('Playgent could not find Copilot log files');
            return;
        }
        
        outputChannel.appendLine(`[${new Date().toISOString()}] ✅ Found ${logFiles.length} Copilot Chat log files:`);
        logFiles.forEach((logFile, index) => {
            outputChannel.appendLine(`[${new Date().toISOString()}] [${index + 1}] ${logFile.path} (Window: ${logFile.windowId})`);
        });
        
        activeLogFiles = logFiles.map(f => f.path);
        
        // Set up watchers for all log files
        outputChannel.appendLine(`[${new Date().toISOString()}] 🔧 Setting up file watchers...`);
        for (const logFile of logFiles) {
            await setupLogFileMonitoring(logFile);
        }
          // Set up polling as backup
        if (!filePollingInterval) {
            filePollingInterval = setInterval(() => {
                activeLogFiles.forEach(filePath => {
                    readLogFile(filePath);
                });
            }, 1000); // Check every second
            outputChannel.appendLine(`[${new Date().toISOString()}] 🔄 Started polling backup for ${activeLogFiles.length} files`);
        }
        
        statusBarItem.text = "$(gamepad) Playgent";
        statusBarItem.tooltip = `Playgent: Monitoring ${logFiles.length} Copilot windows`;
        
        outputChannel.appendLine(`[${new Date().toISOString()}] 🎮 Playgent is now monitoring Copilot activity!`);
        outputChannel.appendLine(`[${new Date().toISOString()}] 💡 Use Copilot Chat to trigger tool_calls and see the game window open`);
        
    } catch (error) {
        outputChannel.appendLine(`[${new Date().toISOString()}] ❌ Error finding logs: ${error}`);
        statusBarItem.text = "$(gamepad) Playgent (!!)";
        statusBarItem.tooltip = "Playgent: Error finding logs";
        vscode.window.showErrorMessage('Playgent encountered an error while finding Copilot logs');
    }
}

/**
 * Set up monitoring for a single log file
 */
async function setupLogFileMonitoring(logFile: LogFileInfo): Promise<void> {
    const filePath = logFile.path;
    
    // Initialize position tracking
    try {
        const stats = fs.statSync(filePath);
        logFilePositions.set(filePath, stats.size); // Start from end of file
        outputChannel.appendLine(`[${new Date().toISOString()}] Initialized position for ${logFile.windowId}: ${stats.size} bytes`);
    } catch (error) {
        logFilePositions.set(filePath, 0);
        outputChannel.appendLine(`[${new Date().toISOString()}] Could not get initial size for ${logFile.windowId}, starting from 0`);
    }
    
    // Set up file watcher
    try {
        const watcher = fs.watch(filePath, (eventType: string) => {
            if (eventType === 'change') {
                outputChannel.appendLine(`[${new Date().toISOString()}] File change detected in ${logFile.windowId}`);
                readLogFile(filePath);
            }
        });
        
        logFileWatchers.set(filePath, watcher);
        outputChannel.appendLine(`[${new Date().toISOString()}] Started watching ${logFile.windowId}`);
        
    } catch (error) {
        outputChannel.appendLine(`[${new Date().toISOString()}] Error setting up watcher for ${logFile.windowId}: ${error}`);
    }
}

/**
 * Find ALL Copilot Chat log files across all windows
 */
async function findAllCopilotLogFiles(): Promise<LogFileInfo[]> {
    try {
        // Get the VS Code logs directory based on platform
        let appDataDir: string;
        if (process.platform === 'darwin') {
            // macOS
            appDataDir = path.join(os.homedir(), 'Library', 'Application Support');
        } else if (process.platform === 'win32') {
            // Windows
            appDataDir = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
        } else {
            // Linux and others
            appDataDir = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config');
        }
            
        // Determine if this is VS Code or VS Code Insiders
        const isInsiders = vscode.env.appName.includes('Insiders');
        const baseLogDir = path.join(appDataDir, isInsiders ? 'Code - Insiders' : 'Code', 'logs');
        
        outputChannel.appendLine(`[${new Date().toISOString()}] 🔍 Platform: ${process.platform}`);
        outputChannel.appendLine(`[${new Date().toISOString()}] 🔍 App Data Dir: ${appDataDir}`);
        outputChannel.appendLine(`[${new Date().toISOString()}] 🔍 Base Log Dir: ${baseLogDir}`);
        outputChannel.appendLine(`[${new Date().toISOString()}] 🔍 VS Code Version: ${isInsiders ? 'Insiders' : 'Stable'}`);
        
        // Check if base log directory exists
        if (!await pathExists(baseLogDir)) {
            outputChannel.appendLine(`[${new Date().toISOString()}] ❌ Base log directory does not exist: ${baseLogDir}`);
            return [];
        }
        
        // Find all date-based directories in the logs folder
        const dateDirs = await fs.promises.readdir(baseLogDir);
        
        // Sort directories by creation time (newest first)
        const sortedDirs = dateDirs
            .filter(dir => dir.match(/^\d{8}T\d{6}$/)) // Filter for date pattern like 20250319T171247
            .sort()
            .reverse();
        
        if (sortedDirs.length === 0) {
            return [];
        }

        const allLogFiles: LogFileInfo[] = [];

        // For each date directory (check recent ones), look for ALL window*/exthost/GitHub.copilot-chat directories
        for (const dateDir of sortedDirs.slice(0, 2)) { // Check only the 2 most recent days
            const dateDirPath = path.join(baseLogDir, dateDir);
              try {                // Get window directories
                const windowDirs = await fs.promises.readdir(dateDirPath);
                const windowDirsFiltered = windowDirs.filter(dir => dir.startsWith('window'));
                
                outputChannel.appendLine(`[${new Date().toISOString()}] Checking date ${dateDir}: found ${windowDirsFiltered.length} windows`);
                  // Check each window directory
                for (const windowDir of windowDirsFiltered) {
                    const windowPath = path.join(dateDirPath, windowDir);
                    const extHostPath = path.join(windowPath, 'exthost', 'GitHub.copilot-chat');
                    
                    outputChannel.appendLine(`[${new Date().toISOString()}] 🔍 Checking: ${extHostPath}`);
                    
                    try {
                        if (await pathExists(extHostPath)) {
                            const files = await fs.promises.readdir(extHostPath);
                            outputChannel.appendLine(`[${new Date().toISOString()}] 📁 Found files in ${windowDir}: ${files.join(', ')}`);
                            
                            const logFile = files.find(file => file.endsWith('.log'));
                            
                            if (logFile) {
                                const logFilePath = path.join(extHostPath, logFile);
                                const stats = await fs.promises.stat(logFilePath);
                                
                                // Only include files that have been modified recently (within last 24 hours)
                                const hoursSinceModified = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60);
                                
                                outputChannel.appendLine(`[${new Date().toISOString()}] 📊 Log file ${logFile}: ${stats.size} bytes, ${hoursSinceModified.toFixed(1)}h ago`);
                                
                                if (hoursSinceModified < 24) {
                                    allLogFiles.push({
                                        path: logFilePath,
                                        windowId: `${dateDir}/${windowDir}`,
                                        lastActivity: stats.mtime,
                                        isActive: hoursSinceModified < 1 // Active if modified within last hour
                                    });
                                    
                                    outputChannel.appendLine(`[${new Date().toISOString()}] ✅ Added active log: ${windowDir} (${hoursSinceModified.toFixed(1)}h ago, ${stats.size} bytes)`);
                                } else {
                                    outputChannel.appendLine(`[${new Date().toISOString()}] ⏰ Skipping old log: ${windowDir} (${hoursSinceModified.toFixed(1)}h ago)`);
                                }
                            } else {
                                outputChannel.appendLine(`[${new Date().toISOString()}] ❌ No .log file found in ${windowDir}`);
                            }
                        } else {
                            outputChannel.appendLine(`[${new Date().toISOString()}] ❌ Path does not exist: ${extHostPath}`);
                        }
                    } catch (error) {
                        outputChannel.appendLine(`[${new Date().toISOString()}] ❌ Error checking ${windowDir}: ${error}`);
                        // Skip this window if there's an error
                        continue;
                    }
                }
            } catch (error) {
                outputChannel.appendLine(`[${new Date().toISOString()}] Error reading date directory ${dateDir}: ${error}`);
                continue;
            }
        }
        
        // Sort by last activity (most recent first)
        allLogFiles.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
        
        return allLogFiles;    } catch (error) {
        outputChannel.appendLine(`[${new Date().toISOString()}] Error searching for all log files: ${error}`);
        return [];
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
        
        // Get the last position for this file
        const lastPosition = logFilePositions.get(filePath) || 0;
        
        // If the file size is smaller than our last position, 
        // the file might have been truncated/rotated
        if (stats.size < lastPosition) {
            outputChannel.appendLine(`[${new Date().toISOString()}] Log file ${filePath} appears to have been truncated, resetting position`);
            logFilePositions.set(filePath, 0);
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
        
        // Update last position for this file
        logFilePositions.set(filePath, stats.size);
        
        // Convert buffer to string and process content
        const content = buffer.toString('utf8');
        if (content.trim()) {
            processLogContent(content, filePath);
        }
    } catch (error) {
        outputChannel.appendLine(`[${new Date().toISOString()}] Error reading log file ${filePath}: ${error}`);
    }
}

/**
 * Process and filter log content
 */
function processLogContent(content: string, filePath: string): void {
    // Split content into lines
    const lines = content.split(/\r?\n/);
    let foundInteresting = false;
    
    // Extract window ID from file path for logging
    const windowMatch = filePath.match(/window\d+/);
    const windowId = windowMatch ? windowMatch[0] : 'unknown';
    
    for (const line of lines) {
        if (!line.trim()) {
            continue;
        }
                
        // Look for timer start/stop messages
        if (line.includes('message 0 returned. finish reason: [tool_calls]')) {
            outputChannel.appendLine(`[${new Date().toISOString()}] ⚡ TOOL_CALLS detected in ${windowId}: Starting timer`);
            startTimer();
        } else if (line.includes('message 0 returned. finish reason: [stop]') && timerStarted) {
            outputChannel.appendLine(`[${new Date().toISOString()}] 🛑 STOP detected in ${windowId}: Stopping timer`);
            stopTimer();
        }
        
        // Filter for interesting log entries
        if (
            line.includes('message 0 returned') ||
            line.includes('finish reason') ||
            line.includes('tool_calls') ||
            line.includes('request done') ||
            line.includes('copilot') || 
            line.includes('chat') || 
            line.includes('completion')
        ) {
            outputChannel.appendLine(`[${windowId}] ${line}`);
            foundInteresting = true;
        }
    }
    
    if (foundInteresting && !timerStarted) {
        // Update status bar with recent activity
        statusBarItem.text = "$(gamepad) Playgent $(check)";
        statusBarItem.tooltip = `Playgent: Activity detected in ${windowId}`;
        
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

/**
 * Show the current monitoring status for debugging
 */
function showMonitoringStatus(): void {
    outputChannel.show();
    outputChannel.appendLine(`[${new Date().toISOString()}] === PLAYGENT MONITORING STATUS ===`);
    outputChannel.appendLine(`[${new Date().toISOString()}] Timer Started: ${timerStarted}`);
    outputChannel.appendLine(`[${new Date().toISOString()}] Active Log Files: ${activeLogFiles.length}`);
    outputChannel.appendLine(`[${new Date().toISOString()}] Watchers: ${logFileWatchers.size}`);
    outputChannel.appendLine(`[${new Date().toISOString()}] Positions tracked: ${logFilePositions.size}`);
    
    activeLogFiles.forEach((filePath, index) => {
        const position = logFilePositions.get(filePath) || 0;
        const windowMatch = filePath.match(/window\d+/);
        const windowId = windowMatch ? windowMatch[0] : 'unknown';
        const hasWatcher = logFileWatchers.has(filePath);
        
        try {
            const stats = fs.statSync(filePath);
            const size = stats.size;
            const mtime = stats.mtime.toLocaleString();
            outputChannel.appendLine(`[${new Date().toISOString()}] [${index + 1}] ${windowId}: ${size} bytes, pos: ${position}, watcher: ${hasWatcher}, modified: ${mtime}`);
        } catch (error) {
            outputChannel.appendLine(`[${new Date().toISOString()}] [${index + 1}] ${windowId}: ERROR - ${error}`);
        }
    });
    
    outputChannel.appendLine(`[${new Date().toISOString()}] === END STATUS ===`);
    
    vscode.window.showInformationMessage(`Monitoring ${activeLogFiles.length} Copilot windows. Check Output > Playgent for details.`);
}
