// popup.js

document.addEventListener("DOMContentLoaded", function () {
  const logoImage = document.getElementById("logo");
  const toggleSwitch = document.getElementById("toggleButton");

  // Set the src for the logo
  logoImage.src = chrome.runtime.getURL("images/logo_128.png");

  // Retrieve extension state from storage
  chrome.storage.local.get(["enabled"], function (result) {
    const isEnabled = result.enabled || false;
    toggleSwitch.checked = isEnabled; // Set the state of the switch

    // Initialize Firebase if the extension is enabled
    if (isEnabled) {
      console.log("Extension is enabled.");
    } else {
      console.log("Extension is disabled.");
    }
  });

  // Toggle switch change event
  toggleSwitch.addEventListener("change", function () {
    const isEnabled = toggleSwitch.checked;
    chrome.storage.local.set({ enabled: isEnabled }, () => {
      if (isEnabled) {
        console.log("Extension is enabled.");
      } else {
        console.log("Extension is disabled.");
      }
    });
  });
});
