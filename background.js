// Background script for Assisted Reader Extension
console.log('Assisted Reader background script loaded');

// Listen for installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Assisted Reader Extension installed:', details.reason);
  
  // No longer opening a GitHub URL on install
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
      
      // Also inject CSS
      return chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        files: ['content.css']
      });
    })
    .then(() => {
      console.log('CSS injected successfully');
      
      // Extract main content
      return chrome.tabs.sendMessage(tab.id, {
        action: 'extractContent',
        method: 'mainContent'
      });
    })
    .then((response) => {
      console.log('Content extraction response:', response);
    })
    .catch((error) => {
      console.error('Error during direct icon click handling:', error);
    });
  } else {
    console.error('Cannot inject content script on this page:', tab.url);
  }
});

// Listen for tab updates to help with debugging
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
    console.log('Tab updated:', tabId, tab.url);
  }
}); 