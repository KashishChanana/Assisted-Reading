// Content script for Assisted Reader Extension
console.log('Assisted Reader content script loaded successfully');

// Global variables
let readerContainer = null;
let originalBodyOverflow = '';
let selectedText = '';

// Function to log errors to the background script
function logError(error) {
  console.error('Content script error:', error);
  try {
    chrome.runtime.sendMessage({
      action: 'logError',
      error: error.toString()
    });
  } catch (e) {
    console.error('Failed to send error to background:', e);
  }
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content script received message:', request);
  
  try {
    if (request.action === 'extractContent') {
      // Extract content based on the specified method
      let extractedContent = '';
      
      if (request.method === 'selection') {
        // Get user's selected text
        extractedContent = window.getSelection().toString();
        if (!extractedContent) {
          sendResponse({ success: false, message: 'No text selected. Please select text on the page first.' });
          return true;
        }
      } else if (request.method === 'mainContent') {
        // Extract main content from the page
        extractedContent = extractMainContent();
      } else if (request.method === 'fullPage') {
        // Extract all text from the page
        extractedContent = document.body.innerText;
      }
      
      if (extractedContent) {
        // Save the extracted content
        selectedText = extractedContent;
        
        // Inject the reader interface
        try {
          injectReaderInterface(extractedContent);
          sendResponse({ success: true, message: 'Content extracted successfully' });
        } catch (error) {
          logError(error);
          sendResponse({ success: false, message: 'Error injecting reader interface: ' + error.message });
        }
      } else {
        sendResponse({ success: false, message: 'Failed to extract content. Try another extraction method.' });
      }
    } else if (request.action === 'closeReader') {
      removeReaderInterface();
      sendResponse({ success: true });
    } else if (request.action === 'ping') {
      // Simple ping to check if content script is loaded
      sendResponse({ success: true, message: 'Content script is active' });
    }
  } catch (error) {
    logError(error);
    sendResponse({ success: false, message: 'Error in content script: ' + error.message });
  }
  
  return true; // Required for async response
});

// Function to extract main content from the page
function extractMainContent() {
  try {
    // Try to find the main content container
    const possibleContentElements = [
      document.querySelector('article'),
      document.querySelector('main'),
      document.querySelector('.content'),
      document.querySelector('.post-content'),
      document.querySelector('.entry-content'),
      document.querySelector('#content')
    ];
    
    // Use the first valid content element found
    const contentElement = possibleContentElements.find(el => el !== null);
    
    if (contentElement) {
      // Get all paragraphs within the content element
      const paragraphs = contentElement.querySelectorAll('p');
      if (paragraphs.length > 0) {
        return Array.from(paragraphs).map(p => p.innerText).join('\n\n');
      } else {
        // If no paragraphs, use the content element's text
        return contentElement.innerText;
      }
    }
    
    // Fallback: try to extract paragraphs from the body
    const bodyParagraphs = document.body.querySelectorAll('p');
    if (bodyParagraphs.length > 0) {
      return Array.from(bodyParagraphs).map(p => p.innerText).join('\n\n');
    }
    
    // Last resort: return all text
    return document.body.innerText;
  } catch (error) {
    logError(error);
    // Return some text even if there's an error
    return document.body.innerText || 'Failed to extract content';
  }
}

// Function to inject the reader interface
function injectReaderInterface(content) {
  // Save original body overflow
  originalBodyOverflow = document.body.style.overflow;
  
  // Create reader container
  readerContainer = document.createElement('div');
  readerContainer.id = 'assisted-reader-container';
  readerContainer.className = 'assisted-reader-overlay';
  
  // Create reader iframe to isolate CSS
  const readerIframe = document.createElement('iframe');
  readerIframe.id = 'assisted-reader-iframe';
  readerIframe.style.width = '100%';
  readerIframe.style.height = '100%';
  readerIframe.style.border = 'none';
  
  // Add close button
  const closeButton = document.createElement('button');
  closeButton.id = 'assisted-reader-close';
  closeButton.innerHTML = '&times;';
  closeButton.addEventListener('click', removeReaderInterface);
  
  // Add elements to the container
  readerContainer.appendChild(closeButton);
  readerContainer.appendChild(readerIframe);
  
  // Add container to the body
  document.body.appendChild(readerContainer);
  
  // Prevent scrolling on the main page
  document.body.style.overflow = 'hidden';
  
  // Set iframe source to a blank page
  readerIframe.src = 'about:blank';
  
  // Wait for iframe to load, then initialize the reader
  readerIframe.onload = () => {
    initializeReader(readerIframe, content);
  };
}

// Function to initialize the reader inside the iframe
function initializeReader(iframe, content) {
  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
  
  // Get the extension URL for loading resources
  const extensionURL = chrome.runtime.getURL('');
  
  // Create HTML structure
  iframeDoc.open();
  iframeDoc.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Assisted Reader</title>
      <link rel="stylesheet" href="${extensionURL}reader.css">
    </head>
    <body>
      <h1>Assisted Reader</h1>
      
      <div id="control-panel">
        <h2>📚 Extracted Content</h2>
        <textarea id="input-text">${escapeHTML(content)}</textarea>
        
        <div class="control-group">
          <div>
            <label for="reading-mode">Reading Mode:</label>
            <select id="reading-mode">
              <option value="normal">Normal</option>
              <option value="bionic">Bionic Reading</option>
              <option value="progressive">Progressive Highlighting</option>
            </select>
          </div>
          
          <div>
            <label for="reading-speed">Speed (WPM):</label>
            <input type="number" id="reading-speed" min="100" max="1000" value="300">
          </div>
          
          <div id="speed-multiplier-container">
            <label for="speed-multiplier">Highlighting Speed:</label>
            <select id="speed-multiplier">
              <option value="2.0">Very Slow</option>
              <option value="1.5" selected>Slow</option>
              <option value="1.0">Normal</option>
              <option value="0.75">Fast</option>
              <option value="0.5">Very Fast</option>
            </select>
          </div>
        </div>
        
        <div id="button-container">
          <button id="start-button">▶️ Start Reading</button>
        </div>
      </div>
      
      <div id="reading-container">
        <div class="progress-container">
          <div class="progress-bar" id="reading-progress"></div>
        </div>
        <div id="reading-time-display"></div>
        <div id="reading-display"></div>
        <button id="completion-button">✓ Mark as Complete</button>
      </div>
      
      <div id="floating-controls">
        <button id="pause-button">⏸️ Pause</button>
        <button id="reset-button">🔄 Reset</button>
      </div>
      
      <script src="${extensionURL}reader.js"></script>
    </body>
    </html>
  `);
  iframeDoc.close();
}

// Function to remove the reader interface
function removeReaderInterface() {
  if (readerContainer) {
    document.body.removeChild(readerContainer);
    document.body.style.overflow = originalBodyOverflow;
    readerContainer = null;
  }
}

// Helper function to escape HTML
function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
} 