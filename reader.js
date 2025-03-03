// Assisted Reader implementation
document.addEventListener('DOMContentLoaded', () => {
  // DOM elements
  const inputText = document.getElementById('input-text');
  const readingMode = document.getElementById('reading-mode');
  const readingSpeed = document.getElementById('reading-speed');
  const speedMultiplier = document.getElementById('speed-multiplier');
  const speedMultiplierContainer = document.getElementById('speed-multiplier-container');
  const startButton = document.getElementById('start-button');
  const pauseButton = document.getElementById('pause-button');
  const resetButton = document.getElementById('reset-button');
  const readingDisplay = document.getElementById('reading-display');
  const readingContainer = document.getElementById('reading-container');
  const readingTimeDisplay = document.getElementById('reading-time-display');
  const readingProgress = document.getElementById('reading-progress');
  const completionButton = document.getElementById('completion-button');
  const floatingControls = document.getElementById('floating-controls');
  const completionSound = document.getElementById('completion-sound');
  
  let timer = null;
  let isPaused = false;
  let isReading = false; // Track if reading is active
  let currentWordIndex = 0;
  let words = [];
  let startTime = null;
  
  // Add event listeners
  startButton.addEventListener('click', startReading);
  pauseButton.addEventListener('click', togglePause);
  resetButton.addEventListener('click', resetReading);
  completionButton.addEventListener('click', markAsComplete);
  
  // Add event listener for reading mode changes
  readingMode.addEventListener('change', () => {
    // Show/hide speed multiplier based on mode
    speedMultiplierContainer.style.display = 
      readingMode.value === 'progressive' ? 'block' : 'none';
  });
  
  // Add event listener to clear output when input changes
  inputText.addEventListener('input', () => {
    // Clear the output display
    readingDisplay.innerHTML = '';
    
    // Hide the reading container until Start Reading is clicked again
    readingContainer.style.display = 'none';
    
    // Hide the floating controls
    floatingControls.style.display = 'none';
    
    // Reset the Start Reading button
    startButton.innerHTML = '<i class="fas fa-play"></i> Start Reading';
    startButton.classList.remove('reading-active');
    
    // Clear any running timers
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  });

  // Add scroll event listener to show/hide floating controls
  window.addEventListener('scroll', () => {
    if (readingContainer.style.display === 'block' && !isPaused) {
      const readingContainerRect = readingContainer.getBoundingClientRect();
      if (readingContainerRect.top < 0) {
        floatingControls.style.display = 'flex';
      } else {
        floatingControls.style.display = 'none';
      }
    }
  });
  
  function startReading() {
    // Clear any existing timers
    if (timer) {
      clearInterval(timer);
    }
    
    // Get the text and reading speed
    const text = inputText.value.trim();
    const wordsPerMinute = parseInt(readingSpeed.value);
    
    // Check if there's text to read
    if (!text) {
      alert('Please enter some text to read.');
      return;
    }
    
    // Remove any static tooltip message
    removeStaticTooltipMessage();
    
    // Set reading state to active
    isReading = true;
    
    // Disable reading mode selection while reading
    readingMode.disabled = true;
    
    // Add tooltip to reading mode
    const readingModeParent = readingMode.parentElement;
    readingModeParent.classList.add('tooltip');
    
    // Create tooltip text if it doesn't exist
    let tooltipText = readingModeParent.querySelector('.tooltip-text');
    if (!tooltipText) {
      tooltipText = document.createElement('span');
      tooltipText.className = 'tooltip-text';
      tooltipText.textContent = 'Pause reading to change mode';
      readingModeParent.appendChild(tooltipText);
    } else {
      tooltipText.style.display = 'block';
    }
    
    // Remove any static message that might be showing
    const staticMessage = document.getElementById('pause-message');
    if (staticMessage) {
      staticMessage.remove();
    }
    
    // Show the reading container
    readingContainer.style.display = 'block';
    
    // Update the Start Reading button
    startButton.innerHTML = '<i class="fas fa-book-open"></i> Reading...';
    startButton.classList.add('reading-active');
    
    // Show the floating controls
    floatingControls.style.display = 'flex';
    
    // Reset the pause state
    isPaused = false;
    pauseButton.innerHTML = '<i class="fas fa-pause"></i> Pause';
    
    // Process the text based on the selected reading mode
    const mode = readingMode.value;
    
    // Split the text into paragraphs
    const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0);
    
    // Process paragraphs for display
    const processedParagraphs = paragraphs.map(paragraph => {
      // Split the paragraph into words
      return paragraph.split(/\s+/).filter(word => word.length > 0);
    });
    
    // Flatten the array of words for progressive highlighting
    words = processedParagraphs.flat();
    
    // Reset the current word index
    currentWordIndex = 0;
    
    // Display estimated reading time
    displayEstimatedReadingTime(text, wordsPerMinute);
    
    // Set the start time for progress tracking
    startTime = Date.now();
    
    // Show/hide speed multiplier based on mode
    speedMultiplierContainer.style.display = 
      mode === 'progressive' ? 'block' : 'none';
    
    // Display the text based on the selected mode
    switch (mode) {
      case 'bionic':
        displayBionicReading(processedParagraphs);
        break;
      case 'progressive':
        startProgressiveHighlighting(wordsPerMinute);
        break;
      default:
        displayNormalText(processedParagraphs);
    }
    
    // Scroll to the reading container
    readingContainer.scrollIntoView({ behavior: 'smooth' });
  }
  
  function togglePause() {
    isPaused = !isPaused;
    
    // Remove any static tooltip message
    removeStaticTooltipMessage();
    
    if (isPaused) {
      // Pause the reading
      clearInterval(timer);
      pauseButton.innerHTML = '<i class="fas fa-play"></i> Resume';
      startButton.innerHTML = '<i class="fas fa-pause"></i> Paused';
      
      // Enable reading mode selection when paused
      readingMode.disabled = false;
      
      // Remove tooltip
      const readingModeParent = readingMode.parentElement;
      readingModeParent.classList.remove('tooltip');
      
      // Hide tooltip text if it exists
      const tooltipText = readingModeParent.querySelector('.tooltip-text');
      if (tooltipText) {
        tooltipText.style.display = 'none';
      }
    } else {
      // Resume the reading
      const wordsPerMinute = parseInt(readingSpeed.value);
      const mode = readingMode.value;
      
      // Disable reading mode selection when resumed
      readingMode.disabled = true;
      
      // Add tooltip back
      const readingModeParent = readingMode.parentElement;
      readingModeParent.classList.add('tooltip');
      
      // Show tooltip text if it exists
      const tooltipText = readingModeParent.querySelector('.tooltip-text');
      if (tooltipText) {
        tooltipText.style.display = 'block';
      }
      
      if (mode === 'progressive') {
        startProgressiveHighlighting(wordsPerMinute, currentWordIndex);
      }
      
      pauseButton.innerHTML = '<i class="fas fa-pause"></i> Pause';
      startButton.innerHTML = '<i class="fas fa-book-open"></i> Reading...';
    }
  }
  
  function resetReading(resetActionButton = true) {
    // Clear any running timers
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    
    // Remove any static tooltip message
    removeStaticTooltipMessage();
    
    // Reset the current word index
    currentWordIndex = 0;
    
    // Reset the pause state
    isPaused = false;
    
    // Reset the reading state
    isReading = false;
    
    // Enable reading mode selection
    readingMode.disabled = false;
    
    // Remove tooltip
    const readingModeParent = readingMode.parentElement;
    readingModeParent.classList.remove('tooltip');
    
    // Hide tooltip text if it exists
    const tooltipText = readingModeParent.querySelector('.tooltip-text');
    if (tooltipText) {
      tooltipText.style.display = 'none';
    }
    
    // Reset the progress bar
    updateProgressBar(0);
    
    // Hide the floating controls
    floatingControls.style.display = 'none';
    
    // Restore both buttons in floating controls
    pauseButton.style.display = 'block';
    resetButton.style.display = 'block';
    
    // Hide the completion button
    completionButton.style.display = 'none';
    
    if (resetActionButton) {
      // Reset the Start Reading button
      startButton.innerHTML = '<i class="fas fa-play"></i> Start Reading';
      startButton.classList.remove('reading-active');
      
      // Hide the reading container
      readingContainer.style.display = 'none';
    } else {
      // Restart reading
      const wordsPerMinute = parseInt(readingSpeed.value);
      const mode = readingMode.value;
      
      if (mode === 'progressive') {
        startProgressiveHighlighting(wordsPerMinute);
      }
    }
  }
  
  function displayBionicReading(processedParagraphs) {
    // Clear the reading display
    readingDisplay.innerHTML = '';
    
    // Process each paragraph
    processedParagraphs.forEach((paragraph, index) => {
      // Create a paragraph element
      const paragraphElement = document.createElement('div');
      paragraphElement.className = 'paragraph';
      
      // Process each word in the paragraph
      paragraph.forEach(word => {
        // Create a span for the word
        const wordSpan = document.createElement('span');
        wordSpan.className = 'word bionic-word';
        
        // Check if the word contains letters (needed for bionic reading)
        const hasLetters = /[a-zA-Z]/.test(word);
        
        // Check if the word is purely numeric
        const isNumeric = /^\d+$/.test(word);
        
        // Check if the word contains emoji or other special Unicode characters
        const hasSpecialUnicode = /[\u{1F000}-\u{1FFFF}]/u.test(word);
        
        // Apply bionic reading only to words with letters that aren't special characters or pure numbers
        if (hasLetters && !hasSpecialUnicode && !isNumeric) {
          // Determine how many characters to bold (roughly half)
          const boldLength = Math.ceil(word.length / 2);
          
          // Create the bionic format (bold first half)
          wordSpan.innerHTML = `<strong>${word.substring(0, boldLength)}</strong>${word.substring(boldLength)}`;
        } else {
          // For non-words (emojis, numbers, special characters, etc.), leave as is
          wordSpan.textContent = word;
        }
        
        // Add the word to the paragraph
        paragraphElement.appendChild(wordSpan);
        
        // Add a space after the word
        paragraphElement.appendChild(document.createTextNode(' '));
      });
      
      // Add the paragraph to the reading display
      readingDisplay.appendChild(paragraphElement);
      
      // Add a paragraph break if it's not the last paragraph
      if (index < processedParagraphs.length - 1) {
        const breakElement = document.createElement('div');
        breakElement.className = 'paragraph-break';
        readingDisplay.appendChild(breakElement);
      }
    });
    
    // Show completion button
    completionButton.style.display = 'block';
    
    // Update progress bar to 100%
    updateProgressBar(100);
  }
  
  function startProgressiveHighlighting(wordsPerMinute, startIndex = 0) {
    const multiplier = document.getElementById('speed-multiplier').value;
    const speedMultiplierValue = parseFloat(multiplier);
    
    // Calculate interval in milliseconds (60,000 ms / wpm), adjusted for the multiplier
    // Since we're highlighting 3 words at a time, we multiply the interval by 3
    const interval = (60000 / wordsPerMinute) * speedMultiplierValue * 3;
    
    // Clear any existing timers
    if (timer) {
      clearInterval(timer);
    }
    
    // Get the text and preserve its format
    const text = inputText.value.trim();
    
    // Process the text while preserving paragraphs and formatting
    const paragraphs = text.split(/\n+/);
    
    // Clear the reading display
    readingDisplay.innerHTML = '';
    
    // Process each paragraph to create word elements while preserving structure
    let allWordElements = [];
    let wordIndex = 0;
    
    paragraphs.forEach((paragraph, paragraphIndex) => {
      if (paragraph.trim() === '') {
        // Create an empty paragraph element for line breaks
        const emptyPara = document.createElement('div');
        emptyPara.className = 'paragraph-break';
        readingDisplay.appendChild(emptyPara);
      } else {
        const paraElement = document.createElement('div');
        paraElement.className = 'paragraph';
        
        // Split paragraph into words but preserve spaces
        const words = paragraph.split(/(\s+)/);
        
        words.forEach(item => {
          if (/\S/.test(item)) { // Only highlight actual words
            const wordSpan = document.createElement('span');
            wordSpan.className = 'word';
            wordSpan.textContent = item;
            paraElement.appendChild(wordSpan);
            allWordElements.push(wordSpan);
            wordIndex++;
          } else {
            // Preserve whitespace
            paraElement.appendChild(document.createTextNode(item));
          }
        });
        
        readingDisplay.appendChild(paraElement);
      }
      
      // Add a paragraph break if it's not the last paragraph
      if (paragraphIndex < paragraphs.length - 1) {
        const breakElement = document.createElement('div');
        breakElement.className = 'paragraph-break';
        readingDisplay.appendChild(breakElement);
      }
    });
    
    // Store all word elements for highlighting
    words = allWordElements;
    
    // Set the current word index
    currentWordIndex = startIndex;
    
    // Show completion button
    completionButton.style.display = 'block';
    
    // Start the progressive highlighting
    timer = setInterval(() => {
      if (currentWordIndex < words.length) {
        // Remove highlighting from all words
        words.forEach(element => {
          element.classList.remove('highlighted');
        });
        
        // Highlight current group of 3 words (or fewer if at the end)
        for (let i = 0; i < 3 && currentWordIndex + i < words.length; i++) {
          words[currentWordIndex + i].classList.add('highlighted');
        }
        
        // Only scroll if the first word in the group is not visible
        const firstWordInGroup = words[currentWordIndex];
        const wordRect = firstWordInGroup.getBoundingClientRect();
        const containerRect = readingDisplay.getBoundingClientRect();
        
        if (wordRect.bottom > containerRect.bottom || wordRect.top < containerRect.top) {
          // Use scrollIntoView with block: "nearest" to minimize movement
          firstWordInGroup.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest',
            inline: 'nearest'
          });
        }
        
        // Update the progress bar
        updateProgressBar((currentWordIndex + 3) / words.length * 100);
        
        // Increment the word index by 3
        currentWordIndex += 3;
      } else {
        // End of text reached
        clearInterval(timer);
        timer = null;
        
        // Show completion button
        completionButton.style.display = 'block';
        
        // Update the Start Reading button
        startButton.innerHTML = '<i class="fas fa-check-circle"></i> Completed';
      }
    }, interval);
  }
  
  function displayNormalText(processedParagraphs) {
    // Clear the reading display
    readingDisplay.innerHTML = '';
    
    // Process each paragraph
    processedParagraphs.forEach((paragraph, index) => {
      // Create a paragraph element
      const paragraphElement = document.createElement('div');
      
      // Process each word in the paragraph
      paragraph.forEach(word => {
        // Create a span for the word
        const wordSpan = document.createElement('span');
        wordSpan.className = 'word';
        wordSpan.textContent = word;
        
        // Add the word to the paragraph
        paragraphElement.appendChild(wordSpan);
        
        // Add a space after the word
        paragraphElement.appendChild(document.createTextNode(' '));
      });
      
      // Add the paragraph to the reading display
      readingDisplay.appendChild(paragraphElement);
      
      // Add a paragraph break if it's not the last paragraph
      if (index < processedParagraphs.length - 1) {
        const breakElement = document.createElement('div');
        breakElement.className = 'paragraph-break';
        readingDisplay.appendChild(breakElement);
      }
    });
    
    // Show completion button
    completionButton.style.display = 'block';
    
    // Update progress bar to 100%
    updateProgressBar(100);
  }
  
  function displayEstimatedReadingTime(text, wpm) {
    // Count the number of words
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    
    // Calculate the reading time in minutes
    const readingTimeMinutes = wordCount / wpm;
    
    // Convert to minutes and seconds
    const minutes = Math.floor(readingTimeMinutes);
    const seconds = Math.round((readingTimeMinutes - minutes) * 60);
    
    // Format the reading time
    let readingTimeText = '';
    
    if (minutes > 0) {
      readingTimeText += `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    
    if (seconds > 0 || minutes === 0) {
      if (minutes > 0) {
        readingTimeText += ' and ';
      }
      readingTimeText += `${seconds} second${seconds !== 1 ? 's' : ''}`;
    }
    
    // Display the reading time
    readingTimeDisplay.innerHTML = `<i class="fas fa-clock"></i> Estimated reading time: ${readingTimeText} (${wordCount} words)`;
    readingTimeDisplay.style.display = 'inline-block';
  }
  
  function highlightCurrentWordInDisplay(index) {
    // Remove highlighting from all words
    const wordElements = readingDisplay.querySelectorAll('.word');
    wordElements.forEach(element => {
      element.classList.remove('highlighted');
    });
    
    // Add highlighting to the current word
    if (index < wordElements.length) {
      wordElements[index].classList.add('highlighted');
      
      // Scroll the word into view if needed
      const wordRect = wordElements[index].getBoundingClientRect();
      const containerRect = readingDisplay.getBoundingClientRect();
      
      if (wordRect.bottom > containerRect.bottom || wordRect.top < containerRect.top) {
        wordElements[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }
  
  function updateProgressBar(percentage) {
    readingProgress.style.width = `${percentage}%`;
  }
  
  function markAsComplete() {
    // Update the Start Reading button
    startButton.innerHTML = '<i class="fas fa-check-circle"></i> Completed';
    
    // Hide the completion button
    completionButton.style.display = 'none';
    
    // Remove any static tooltip message
    removeStaticTooltipMessage();
    
    // Reset reading state
    isReading = false;
    
    // Enable reading mode selection
    readingMode.disabled = false;
    
    // Remove tooltip
    const readingModeParent = readingMode.parentElement;
    readingModeParent.classList.remove('tooltip');
    
    // Hide tooltip text if it exists
    const tooltipText = readingModeParent.querySelector('.tooltip-text');
    if (tooltipText) {
      tooltipText.style.display = 'none';
    }
    
    // Show a completion message
    const completionMessage = document.createElement('div');
    completionMessage.className = 'completion-message';
    completionMessage.innerHTML = '<i class="fas fa-trophy"></i> Reading completed!';
    readingDisplay.appendChild(completionMessage);
    
    // Play a simple completion sound
    if (completionSound) {
      // Set a very low volume for a subtle effect
      completionSound.volume = 0.15;
      completionSound.currentTime = 0;
      completionSound.play().catch(e => console.log('Error playing sound:', e));
    }
    
    // Launch confetti animation
    launchConfetti();
    
    // Modify floating controls to only show reset button
    pauseButton.style.display = 'none';
    resetButton.style.display = 'block';
    floatingControls.style.display = 'flex';
    
    // Clear any running timers
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    
    // Scroll to the completion message
    completionMessage.scrollIntoView({ behavior: 'smooth' });
  }
  
  function launchConfetti() {
    // Check if confetti is available
    if (typeof confetti === 'undefined') {
      console.log('Confetti library not loaded');
      return;
    }
    
    // Configure and launch confetti
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    
    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }
    
    // Create an interval to continuously launch confetti
    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      
      const particleCount = 50 * (timeLeft / duration);
      
      // Launch confetti from both sides
      confetti(Object.assign({}, defaults, { 
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      }));
      
      confetti(Object.assign({}, defaults, { 
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      }));
    }, 250);
    
    // Add a one-time big burst in the center
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
  
  // Enhance UI on load
  enhanceUI();
  removeStaticTooltipMessage();
  
  function enhanceUI() {
    // Initially hide the reading container
    readingContainer.style.display = 'none';
    
    // Initially hide the floating controls
    floatingControls.style.display = 'none';
    
    // Make sure both buttons in floating controls are visible by default
    pauseButton.style.display = 'block';
    resetButton.style.display = 'block';
    
    // Initially hide the completion button
    completionButton.style.display = 'none';
    
    // Initially hide the speed multiplier container
    speedMultiplierContainer.style.display = 'none';
    
    // Show/hide speed multiplier based on current mode
    readingMode.addEventListener('change', function() {
      // Handle speed multiplier visibility
      speedMultiplierContainer.style.display = 
        this.value === 'progressive' ? 'block' : 'none';
    });
    
    // Add placeholder text to the input
    inputText.placeholder = 'Paste or type your text here to begin reading...';
    
    // Focus on the input text area
    inputText.focus();
  }

  // Function to check for and remove any static tooltip message
  function removeStaticTooltipMessage() {
    // Check for any elements containing the text "Pause reading to change mode"
    const elements = Array.from(document.querySelectorAll('*'));
    for (const element of elements) {
      if (element.childNodes.length === 1 && 
          element.childNodes[0].nodeType === Node.TEXT_NODE && 
          element.childNodes[0].textContent.trim() === 'Pause reading to change mode' &&
          !element.classList.contains('tooltip-text')) {
        element.remove();
      }
    }
  }
}); 