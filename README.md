# Playgent Extension

Playgent is a fun and interactive VS Code extension that brings mini-games directly into your editor. Whether you're taking a break or looking for a quick challenge, Playgent has you covered!

## Games Included

- **Robot Game**: A classic endless runner game where you jump over obstacles.
- **Memory Game**: Test your memory by matching pairs of cards.
- **Simon Says**: Follow the sequence of lights and sounds to win.
- **Random xkcd**: Get random xkcd strips.

## How It Works

- The games automatically load whenever GitHub Copilot starts thinking, providing you with a fun distraction while waiting for suggestions.
- Once GitHub Copilot stops thinking, the games immediately close, allowing you to return to your work seamlessly.
- You can also manually launch games by opening the command palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on Mac) and searching for the game you want to play.

## When to Use

- **Take a Break**: Use Playgent to relax during your coding sessions.
- **Challenge Yourself**: Compete with friends or colleagues to achieve the highest scores.

## Installation

To install and share this extension, follow these steps:

1. **Create the `.vsix` File**:
   - Install the VSCE tool globally if you haven't already:
     ```bash
     npm install -g @vscode/vsce
     ```
   - Navigate to the root of this project in your terminal.
   - Run the following command to package the extension:
     ```bash
     vsce package
     ```
   - This will generate a `.vsix` file in the project directory.

2. **Install the Extension**:
   - Open your terminal and run the following command to install the extension:
     ```bash
     code --install-extension <path-to-vsix-file>
     ```
   - Alternatively, drag and drop the `.vsix` file into the Extensions view in VS Code.

3. **Share the Extension**:
   - Share the `.vsix` file with your friends via email, cloud storage, or any file-sharing service.

4. **Optional: Host the Extension**:
   - If you want to provide a simple download link, you can host the `.vsix` file on a static file server or a cloud storage service and share the link.

## Feedback

We'd love to hear your thoughts! Feel free to share feedback or suggest new games to include in future updates.
