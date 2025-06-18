/**
 * Interface for a game in the Copilot monitor
 */
export interface CopilotGame {
    /** Unique identifier for the game */
    id: string;
    
    /** Display name of the game */
    name: string;
    
    /** Description of the game */
    description: string;
    
    /** HTML content for the game */
    getHtmlContent(): string;
    
    /** CSS content for the game */
    getCssContent(): string;
    
    /** JavaScript content for the game */
    getJavaScriptContent(): string;
}

/**
 * Game registry for storing all available games
 */
export class GameRegistry {
    private static games: Map<string, CopilotGame> = new Map();
    
    /**
     * Register a new game
     */
    static registerGame(game: CopilotGame): void {
        this.games.set(game.id, game);
    }
    
    /**
     * Get a game by ID
     */
    static getGame(id: string): CopilotGame | undefined {
        return this.games.get(id);
    }
    
    /**
     * Get all registered games
     */
    static getAllGames(): CopilotGame[] {
        return Array.from(this.games.values());
    }
      /**
     * Get the default game (first registered game)
     */
    static getDefaultGame(): CopilotGame | undefined {
        const games = this.getAllGames();
        return games.length > 0 ? games[0] : undefined;
    }

    /**
     * Get a random game
     */
    static getRandomGame(): CopilotGame | undefined {
        const games = this.getAllGames();
        if (games.length === 0) {
            return undefined;
        }
        const randomIndex = Math.floor(Math.random() * games.length);
        return games[randomIndex];
    }
}