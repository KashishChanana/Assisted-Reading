#!/bin/bash

# Manual build script for Assisted Reader Extension (no Node.js required)

echo "Building Assisted Reader Extension manually..."

# Create a build directory
mkdir -p build
mkdir -p build/icons

# Copy the manifest file
cp manifest.json build/

# Copy the HTML and CSS files
cp popup.html build/
cp content.css build/

# Copy reader files
if [ -f "reader.js" ]; then
  echo "Copying reader.js..."
  cp reader.js build/
else
  echo "Error: reader.js not found!"
  exit 1
fi

if [ -f "reader.css" ]; then
  echo "Copying reader.css..."
  cp reader.css build/
else
  echo "Error: reader.css not found!"
  exit 1
fi

# Copy icons
echo "Copying icons..."
if [ -d "icons" ]; then
  cp icons/*.svg build/icons/
  
  # Convert SVG to PNG if needed (browsers will accept SVG files as is)
  cp icons/icon16.svg build/icons/icon16.png
  cp icons/icon48.svg build/icons/icon48.png
  cp icons/icon128.svg build/icons/icon128.png
else
  echo "Warning: No icons directory found. Creating placeholder icons..."
  echo '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#3498db"/><circle cx="8" cy="8" r="5" fill="#ecf0f1"/><path d="M5,7 L11,7 M5,8 L11,8 M5,9 L11,9" stroke="#2c3e50" stroke-width="1" stroke-linecap="round"/></svg>' > build/icons/icon16.svg
  echo '<svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#3498db"/><circle cx="24" cy="24" r="16" fill="#ecf0f1"/><path d="M16,21 L32,21 M16,24 L32,24 M16,27 L32,27" stroke="#2c3e50" stroke-width="2" stroke-linecap="round"/></svg>' > build/icons/icon48.svg
  echo '<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#3498db"/><circle cx="64" cy="64" r="42" fill="#ecf0f1"/><path d="M42,56 L86,56 M42,64 L86,64 M42,72 L86,72" stroke="#2c3e50" stroke-width="4" stroke-linecap="round"/></svg>' > build/icons/icon128.svg
  
  # Copy the SVG files as PNG files
  cp build/icons/icon16.svg build/icons/icon16.png
  cp build/icons/icon48.svg build/icons/icon48.png
  cp build/icons/icon128.svg build/icons/icon128.png
fi

# Copy the JavaScript files
cp popup.js build/

# Create or copy the background script
if [ -f "background.js" ]; then
  cp background.js build/
else
  echo "Creating background.js..."
  cat > build/background.js << 'EOL'
// Background script for Assisted Reader Extension
console.log('Assisted Reader background script loaded');

// Listen for installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Assisted Reader Extension installed:', details.reason);
});

// Listen for errors and messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message, 'from:', sender);
  
  if (message.action === 'logError') {
    console.error('Content script error:', message.error);
    sendResponse({ received: true });
  }
  
  return true; // Required for async response
});

// Handle extension icon clicks (fallback if popup fails)
chrome.action.onClicked.addListener((tab) => {
  // This only runs if the popup fails to open
  console.log('Extension icon clicked directly (no popup) on tab:', tab.id);
  
  // Try to inject the content script manually
  if (tab.url && tab.url.startsWith('http')) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    })
    .then(() => {
      console.log('Content script injected successfully via direct click');
    })
    .catch((error) => {
      console.error('Error during direct icon click handling:', error);
    });
  }
});
EOL
fi

# Copy the content.js file
echo "Copying content.js file..."
cp content.js build/

echo "Build completed! Extension files are in the 'build' directory."
echo ""
echo "To use the extension:"
echo "1. Open Chrome and go to chrome://extensions"
echo "2. Enable 'Developer mode'"
echo "3. Click 'Load unpacked' and select the 'build' directory"
echo "4. After installing, refresh any open tabs where you want to use the extension" 