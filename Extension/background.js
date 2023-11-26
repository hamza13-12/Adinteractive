// background.js

// Flag to keep track of extension state
let extensionEnabled = false;

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleExtension") {
    extensionEnabled = !extensionEnabled;
    sendResponse({status: extensionEnabled ? "enabled" : "disabled"});
  }

  // If the content script asks to process the frame
  if (request.action === "processFrame" && extensionEnabled) {
    // Here you would send the frame to your Flask API
    // For now, we'll just simulate a response
    setTimeout(() => {
      sendResponse({ annotations: "Dummy annotations data" });
    }, 1000);
    return true; // indicates you wish to send a response asynchronously
  }
});
