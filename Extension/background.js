// background.js

// Flag to keep track of extension state
let extensionEnabled = false;

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request.action)
  if (request.action === "toggleExtension") {
    extensionEnabled = !extensionEnabled;
    sendResponse({status: extensionEnabled ? "enabled" : "disabled"});
  }

  // If the content script asks to process the frame
  if (request.action === "processFrame" && extensionEnabled) {
      // to process the frame from the api
    setTimeout(() => {
      sendResponse({ annotations: 
        [
          // dummy data
          {
            "label": "Person",
            "confidence": 0.999,
            "topleft": {
              "x": 0,
              "y": 0
            },
            "bottomright": {
              "x": 100,
              "y": 100
            }
          }
        ] });
    }, 1000);
    return true; // indicates you wish to send a response asynchronously
  }
});
