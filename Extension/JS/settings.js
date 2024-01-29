/* settings.js */

// Initialize settings
let userSettings = {
  categories: [],
};

// Save settings to local storage
function saveSettings() {
  chrome.storage.local.set({ userSettings }, function () {
    console.log("Settings saved:", userSettings);
  });
}

// Load settings from local storage
function loadSettings(callback) {
  chrome.storage.local.get(["userSettings"], function (result) {
    if (result.userSettings) {
      userSettings = result.userSettings;
      console.log("Settings loaded:", userSettings);
      if (typeof callback === "function") callback();
    }
  });
}

// Apply user settings to filter annotations
function applyUserSettingsToAnnotations(data) {
  return data.filter((item) => userSettings.categories.includes(item.label));
}

// Handle checkbox changes
function handleCategoryChange() {
  const checkboxes = document.querySelectorAll(
    '#settings-categories input[type="checkbox"]'
  );
  userSettings.categories = Array.from(checkboxes)
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);
  saveSettings();
}

function updatePanelPosition() {
  const video = document.querySelector("video");
  const panel = document.getElementById("settings-panel");

  if (video && panel) {
    const videoRect = video.getBoundingClientRect();
    const panelWidth = panel.offsetWidth;
    const panelHeight = panel.offsetHeight;

    // Center the panel over the video
    panel.style.left = `${
      videoRect.left + videoRect.width / 2 - panelWidth / 2
    }px`;
    panel.style.top = `${
      videoRect.top + videoRect.height / 2 - panelHeight / 2
    }px`;
  }
}

function createSettingsPanel(categories) {
  const panel = document.createElement("div");
  panel.id = "settings-panel";
  panel.style.display = "none";

  // Start the innerHTML with the header
  let innerHTML = `<h3>Filter by Category:</h3><div id="settings-categories">`;

  // Loop over the categories to create checkbox inputs
  categories.forEach((category) => {
    innerHTML += `<label><input type="checkbox" value="${category}"> ${category} </label>`;
  });

  // Close the settings-categories div and add the save button
  innerHTML += `</div><button id="save-settings">Save</button>`;

  // Set the innerHTML of the panel
  panel.innerHTML = innerHTML;

  return panel;
}
