// background.js

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "processFrame") {
    const apiUrl = "http://127.0.0.1:5000"; // Flask API
    const data = {
      frameData: request.dataURL,
      movieName: "granTurismo", // Hardcoded for now
    };

    // Log the JSON request
    console.log("JSON request being sent:", JSON.stringify(data));

    fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
        sendResponse({ farewell: "response received", data: data });
      })
      .catch((error) => {
        console.error("Error:", error);
        sendResponse({ farewell: "error", error: error });
      });

    return true; // indicates you wish to send a response asynchronously
  }
});
