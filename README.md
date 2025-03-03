# Assisted Reader Browser Extension

A browser extension that brings the Assisted Reader functionality to any website, allowing you to read content with enhanced reading modes like Bionic Reading and Progressive Highlighting.

## Features

- Extract content from any webpage in three ways:
  - Selected text
  - Main content (automatically detects the main article)
  - Full page text
- Three reading modes:
  - Normal
  - Bionic Reading (highlights the first few letters of each word)
  - Progressive Highlighting (highlights words in groups of three as you read)
- Adjustable reading speed
- Reading progress tracking
- Estimated reading time display
- Pause, reset, and completion controls

## Installation

### Chrome/Edge/Brave

1. Clone or download this repository
2. Run `node build.js` to prepare the extension
3. Open Chrome and navigate to `chrome://extensions/`
4. Enable "Developer mode" in the top-right corner
5. Click "Load unpacked" and select the directory containing this extension
6. The extension icon should appear in your browser toolbar

### Firefox

1. Clone or download this repository
2. Run `node build.js` to prepare the extension
3. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
4. Click "Load Temporary Add-on..."
5. Select the `manifest.json` file in the extension directory
6. The extension icon should appear in your browser toolbar

## Usage

1. Navigate to any webpage with content you want to read
2. Click the Assisted Reader extension icon in your browser toolbar
3. Choose how you want to extract content:
   - Selected Text: First select text on the page, then use this option
   - Main Content: Automatically extracts the main article content
   - Full Page: Extracts all text from the page
4. Click "Start Reading"
5. Choose your preferred reading mode and speed
6. Click "Start Reading" again to begin
7. Use the floating controls to pause or reset your reading session
8. Click "Mark as Complete" when you're done

## How It Works

The extension injects a reader interface into the current webpage, allowing you to read content with enhanced reading modes without leaving the site. The reader interface is isolated from the page's styles and scripts, ensuring a consistent reading experience across all websites.

## License

MIT