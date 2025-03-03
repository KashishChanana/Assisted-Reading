# Assisted Reader Extension Guide

This guide will help you install and use the Assisted Reader browser extension to enhance your reading experience on any website.

## Installation

### Prerequisites

- Node.js (for building the extension)
- Chrome, Edge, Brave, or Firefox browser

### Building the Extension

1. Clone or download this repository
2. Open a terminal and navigate to the repository directory
3. Run the build script:
   ```
   ./build.sh
   ```
   
   Or manually:
   ```
   node icons/create_icons.js
   node build.js
   ```

### Installing in Chrome/Edge/Brave

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top-right corner
3. Click "Load unpacked" and select the directory containing this extension
4. The extension icon should appear in your browser toolbar

### Installing in Firefox

1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on..."
3. Select the `manifest.json` file in the extension directory
4. The extension icon should appear in your browser toolbar

## Using the Extension

### Extracting Content

1. Navigate to any webpage with content you want to read
2. Click the Assisted Reader extension icon in your browser toolbar
3. Choose how you want to extract content:
   - **Selected Text**: First select text on the page, then use this option
   - **Main Content**: Automatically extracts the main article content
   - **Full Page**: Extracts all text from the page
4. Click "Start Reading"

### Reading Interface

Once the content is extracted, you'll see the Assisted Reader interface with the following components:

1. **Control Panel**: Contains the extracted text and reading options
   - Reading Mode dropdown (Normal, Bionic, Progressive)
   - Reading Speed control (WPM)
   - Highlighting Speed control (for Progressive mode)
   - Start Reading button

2. **Reading Display**: Shows the text in the selected reading mode

3. **Floating Controls**:
   - Pause/Resume button
   - Reset button

4. **Progress Bar**: Shows your reading progress

### Reading Modes

- **Normal**: Displays the text normally without any enhancements
- **Bionic Reading**: Highlights the first few letters of each word to help your brain recognize words faster
- **Progressive Highlighting**: Automatically highlights words in groups of three as you read, guiding your eyes through the text

### Controls

- **Start Reading**: Begins the reading session with the selected mode and speed
- **Pause/Resume**: Pauses or resumes the current reading session
- **Reset**: Resets the reading session to the beginning
- **Mark as Complete**: Marks the reading session as complete and shows a celebration animation

### Adjusting Speed

- **Reading Speed (WPM)**: Controls how fast words are highlighted in Progressive mode or displayed in RSVP mode
- **Highlighting Speed**: (Progressive mode only) Adjusts how quickly the highlighting moves through the text

## Troubleshooting

- **Extension not working**: Try refreshing the page and reopening the extension
- **Content not extracting properly**: Try a different extraction method or select the text manually
- **Reading mode not working**: Reset the reading session and try again

## Feedback and Support

If you encounter any issues or have suggestions for improvement, please open an issue on the GitHub repository. 