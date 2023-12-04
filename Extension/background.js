// background.js

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(
    sender.tab
      ? "from a content script:" + sender.tab.url
      : "from the extension"
  );
  if (request.action === "processFrame") {
    // Use the dataURL for whatever you need
    // Process Api here
    // send the json from api file as response

    sendResponse({ farewell: "goodby" });
  }
  return true;
});
