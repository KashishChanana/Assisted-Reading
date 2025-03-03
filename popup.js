// Popup script for Assisted Reader Extension
console.log('Popup script loaded');

document.addEventListener('DOMContentLoaded', function() {
  // DOM elements
  const extractButtons = document.querySelectorAll('.extract-btn');
  const statusMessage = document.getElementById('status-message');
  
  // Check if content script is loaded when popup opens
  checkAndInjectContentScript();
  
  // Add event listeners to extract buttons
  extractButtons.forEach(button => {
    button.addEventListener('click', function() {
      const method = this.getAttribute('data-method');
      extractContent(method);
    });
  });
  
  // Function to check if content script is loaded and inject if needed
  async function checkAndInjectContentScript() {
    try {
      // First try to ping the content script
      const isLoaded = await checkContentScript();
      
      if (!isLoaded) {
        showStatus('Initializing content script...', 'loading');
        const injected = await injectContentScript();
        
        if (injected) {
          showStatus('Ready to extract content', 'success');
          setTimeout(() => {
            statusMessage.style.display = 'none';
          }, 1500);
        } else {
          showStatus('Error: Cannot inject content script. Try refreshing the page or check console for errors.', 'error');
        }
      }
    } catch (error) {
      console.error('Error during content script initialization:', error);
      showStatus('Error initializing. Try refreshing the page.', 'error');
    }
  }
  
  // Function to check if content script is loaded
  async function checkContentScript() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) {
        console.error('No active tab found');
        return false;
      }
      
      // Try to send a ping message to the content script
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'ping' })
        .catch(error => {
          console.log('Content script not loaded:', error);
          return null;
        });
      
      return response && response.success;
    } catch (error) {
      console.error('Error checking content script:', error);
      return false;
    }
  }
  
  // Function to inject content script
  async function injectContentScript() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) {
        showStatus('Error: Cannot find active tab', 'error');
        return false;
      }
      
      // Check if we have permission to access this tab
      if (!tab.url || !tab.url.startsWith('http')) {
        showStatus('Error: Cannot access this page. Try a regular web page.', 'error');
        return false;
      }
      
      console.log('Injecting content script into tab:', tab.id);
      
      // First inject the CSS
      await chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        files: ['content.css']
      });
      
      // Then inject the JS
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
      
      console.log('Content script injected successfully');
      
      // Verify the content script was injected by pinging it
      const isLoaded = await checkContentScript();
      if (!isLoaded) {
        console.error('Content script was injected but is not responding');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Failed to inject content script:', error);
      
      // Provide more specific error messages based on the error
      if (error.message.includes('Cannot access contents of the page')) {
        showStatus('Error: Cannot access this page. Try a regular web page.', 'error');
      } else if (error.message.includes('Missing host permission')) {
        showStatus('Error: Missing host permission. Try refreshing the page.', 'error');
      } else {
        showStatus('Error: ' + error.message, 'error');
      }
      
      return false;
    }
  }
  
  // Function to extract content
  async function extractContent(method) {
    // Show loading state
    showStatus('Processing...', 'loading');
    
    // Disable all buttons during processing
    extractButtons.forEach(btn => btn.disabled = true);
    
    try {
      // Make sure content script is loaded
      const isContentScriptReady = await checkContentScript();
      if (!isContentScriptReady) {
        // Try to inject it
        const injected = await injectContentScript();
        if (!injected) {
          extractButtons.forEach(btn => btn.disabled = false);
          return;
        }
      }
      
      // Get the active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) {
        showStatus('Error: Cannot find active tab', 'error');
        extractButtons.forEach(btn => btn.disabled = false);
        return;
      }
      
      // Send message to content script
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'extractContent',
        method: method
      }).catch(error => {
        console.error('Error sending message to content script:', error);
        return { success: false, message: 'Failed to communicate with the page. Try refreshing.' };
      });
      
      // Handle response
      if (response && response.success) {
        showStatus('Success: ' + response.message, 'success');
        window.close(); // Close the popup
      } else {
        showStatus('Error: ' + (response ? response.message : 'Unknown error'), 'error');
      }
    } catch (error) {
      console.error('Error extracting content:', error);
      showStatus('Error: ' + error.message, 'error');
    }
    
    // Re-enable buttons
    extractButtons.forEach(btn => btn.disabled = false);
  }
  
  // Function to show status message
  function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = 'status-message ' + type;
    statusMessage.style.display = 'block';
  }
}); 