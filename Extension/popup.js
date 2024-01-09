// popup.js
document.addEventListener("DOMContentLoaded", function () {
  const toggleButton = document.getElementById("toggleButton");

  // Retrieve extension state from storage
  chrome.storage.local.get(["enabled"], function (result) {
    const isEnabled = result.enabled || false;
    updateToggleButton(isEnabled);
  });

  // Toggle button click event
  toggleButton.addEventListener("click", function () {
    // Toggle extension state
    chrome.storage.local.get(["enabled"], function (result) {
      const isEnabled = result.enabled || false;
      chrome.storage.local.set({ enabled: !isEnabled });
      updateToggleButton(!isEnabled);
      if (isEnabled) {
        // Your extension functionality goes here
        console.log("Extension is enabled.");
      } else {
        console.log("Extension is disabled.");
      }
    });
  });

  // Function to update the toggle button text and color
  function updateToggleButton(isEnabled) {
    toggleButton.textContent = isEnabled
      ? "Disable Extension"
      : "Enable Extension";
    toggleButton.style.backgroundColor = isEnabled ? "red" : "green";
  }
});
chrome.storage.local.get(["enabled"], function (result) {
  const isEnabled = result.enabled || false;
});
