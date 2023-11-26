document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('toggle');
    
    toggleButton.addEventListener('click', () => {
      // Send a message to the content script to pause the video
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {action: "togglePause"});
      });
    });
  });
  