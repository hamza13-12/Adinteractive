// popup.js

document.addEventListener("DOMContentLoaded", function () {
  const logoImage = document.getElementById("logo");
  const toggleSwitch = document.getElementById("toggleButton");
  const firebaseSandboxIframe = document.getElementById("firebase-sandbox");

  // Set the src for the logo
  logoImage.src = chrome.runtime.getURL("images/logo_128.png");

  // Post a message to the sandbox iframe to initialize Firebase
  if (firebaseSandboxIframe) {
      firebaseSandboxIframe.onload = function() {
          firebaseSandboxIframe.contentWindow.postMessage({ type: 'init-firebase' }, '*');
      };
  } else {
      console.error("Sandbox iframe not found");
  }

  // Listen for messages from the sandbox iframe
  window.addEventListener('message', function (event) {
      if (event.origin === window.location.origin) {
          if (event.data.type === 'firebase-initialized') {
              console.log("Firebase has been initialized in the sandbox:", event.data.detail);
              // Firebase is initialized, now you can perform other actions that require Firebase
          } else if (event.data.type === 'firebase-initialization-failed') {
              console.error("Firebase initialization failed in the sandbox:", event.data.error);
              // Handle Firebase initialization failure
          } else if (event.data.type === 'login-response') {
              if (event.data.success) {
                  console.log("Login successful", event.data.user);
                  // Update UI and local state as necessary
                  chrome.storage.local.set({ loggedIn: true });
              } else {
                  console.error("Login failed", event.data.error);
                  // Update UI to show error
              }
          }
      }
  });

  // Check if the user is logged in and update the toggle switch
  chrome.storage.local.get(["loggedIn", "enabled"], function (result) {
      if (result.loggedIn) {
          toggleSwitch.checked = result.enabled || false;
          toggleSwitch.addEventListener("change", function () {
              const isEnabled = toggleSwitch.checked;
              chrome.storage.local.set({ enabled: isEnabled }, () => {
                  if (isEnabled) {
                      console.log("Extension is enabled.");
                      // Perform any enabled state functionalities
                  } else {
                      console.log("Extension is disabled.");
                      // Perform any cleanup or disabled state functionalities
                  }
              });
          });
      } else {
          // Intercept the toggle switch action and redirect to login.html
          toggleSwitch.addEventListener("click", function (event) {
              event.preventDefault();
              window.location.href = 'login.html';
          });
      }
  });
});
