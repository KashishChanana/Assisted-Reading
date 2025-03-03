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
- Celebration animation on completion

## Installation

### Chrome/Edge/Brave

1. Clone or download this repository
   ```
   git clone https://github.com/KashishChanana/Assisted-Reading.git
   cd Assisted-Reading
   ```

2. Build the extension
   ```
   ./manual_build.sh
   ```
   
   Alternatively, if you have npm installed:
   ```
   npm run build
   ```

3. Open Chrome and navigate to `chrome://extensions/`
4. Enable "Developer mode" in the top-right corner
5. Click "Load unpacked" and select the `build` directory
6. The extension icon should appear in your browser toolbar

### Firefox

*Note: This extension is primarily designed for Chromium-based browsers. Firefox support may require additional modifications.*

1. Clone or download this repository
2. Build the extension using `./manual_build.sh`
3. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
4. Click "Load Temporary Add-on..."
5. Select the `manifest.json` file in the `build` directory
6. The extension icon should appear in your browser toolbar

## Usage

1. Navigate to any webpage with content you want to read
2. Click the Assisted Reader extension icon in your browser toolbar
3. Choose how you want to extract content:
   - Selected Text: First select text on the page, then use this option
   - Main Content: Automatically extracts the main article content
   - Full Page: Extracts all text from the page
4. Choose your preferred reading mode and speed
5. Click "Extract Content" to begin
6. Use the floating controls to pause or reset your reading session
7. Click "Mark as Complete" when you're done

## Project Structure

- `manifest.json` - Extension configuration
- `popup.html` & `popup.js` - Extension popup interface
- `content.js` & `content.css` - Content scripts injected into web pages
- `reader.js` & `reader.css` - Reader functionality and styling
- `background.js` - Background script for extension events
- `manual_build.sh` - Build script to prepare the extension

## Troubleshooting

If the extension doesn't work as expected:

1. Make sure you've refreshed the page after installing the extension
2. Check the browser console for any error messages
3. Try reloading the extension from the extensions page
4. If content extraction fails, try a different extraction method

## License

MIT