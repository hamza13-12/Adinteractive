// content.js

chrome.storage.local.get(["enabled"], function (result) {
  const isEnabled = result.enabled || false;

  if (isEnabled) {
    const videoID = GetYoutubeVideoId(document.URL);
    var DataBaseApi = "https://mhfateen.pythonanywhere.com/check/";
    DataBaseApi = DataBaseApi + videoID;
    console.log(DataBaseApi);
    DataBaseApiCallback(DataBaseApi);
  } else {
    console.log("Extension is disabled.");
  }
});

// Function to handle changes in the storage
function handleStorageChanges(changes, namespace) {
  for (let key in changes) {
    console.log(key, changes[key]);
    if (key === "enabled") {
      const newEnabledValue = changes[key].newValue;
      // Your logic to handle the change in isEnabled value
      console.log("Extension state changed. New value:", newEnabledValue);
      if (newEnabledValue) {
        const videoID = GetYoutubeVideoId(document.URL);
        var DataBaseApi = "https://mhfateen.pythonanywhere.com/check/";
        DataBaseApi = DataBaseApi + videoID;
        console.log(DataBaseApi);
        DataBaseApiCallback(DataBaseApi);
      } else {
        removeAnnotations();
        const sidebar = document.querySelector(".sidebar");
        sidebar.remove();
        document.querySelector(".sneak-peek").remove();
        logo(false);
      }
    }
  }
}

// Add an event listener for storage changes
chrome.storage.onChanged.addListener(handleStorageChanges);

// Your existing code that depends on the initial isEnabled value

function DataBaseApiCallback(link) {
  fetch(link)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json(); // or response.text() if the response is not JSON
    })
    .then((data) => {
      // Process the data returned by the API\
      if (data.result == true) {
        insertSidebar();
        toggleSidebar("none");
        handleVideoPlayback();
        logo(true);
        document
          .getElementById("bookmarkButton")
          .addEventListener("click", BookMarkSlide);
      }
      console.log("API response:", data);
    })
    .catch((error) => {
      console.error("Error making API request:", error);
    });
}

// ==================================Settings Functionality========================================

// Helper function to toggle visibility
function toggleElementVisibility(element) {
  element.style.display = element.style.display === "none" ? "block" : "none";
}

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

// Create Settings Panel
function createSettingsPanel() {
  const panel = document.createElement("div");
  panel.id = "settings-panel";
  panel.style.display = "none";
  panel.innerHTML = `
    <h3>Filter by Category:</h3>
    <div id="settings-categories">
      <label><input type="checkbox" value="Furniture"> Furniture </label>
      <label><input type="checkbox" value="Electronics"> Electronics </label>
      <label><input type="checkbox" value="Dress"> Dress </label>
      <label><input type="checkbox" value="Food & Beverages"> Food & Beverages </label>
      <label><input type="checkbox" value="Bags"> Household Items </label>
      <label><input type="checkbox" value="Watches"> Watches </label>
      <label><input type="checkbox" value="Sunglasses"> Sunglasses </label>
    </div>
    <button id="save-settings">Save</button>
  `;
  return panel;
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

function GetYoutubeVideoId(URL) {
  var video_id = URL.split("v=")[1];
  var ampersandPosition = video_id.indexOf("&");
  if (ampersandPosition != -1) {
    video_id = video_id.substring(0, ampersandPosition);
  }
  return video_id;
}

// ==========================Background Communication=============================
// Function to send a message to the background script
// The message contains the current video frame as a data URL
function sendMessageToBackground(message) {
  (async () => {
    const response = await chrome.runtime.sendMessage(message);
    console.log(response);
    if (response && response.data) {
      console.log("Response from Frame API:", response);
      displayAnnotations(response.data);
    }
    // response is json from api
    // use it to display the pointers on the video
    return response;
  })();
}

VideoInDB = true;

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(request.state);
  return true;
});

// Function to capture the current video frame
// and send it to the background script
async function captureFrame(bool, frame) {
  const video = document.querySelector("video");
  // Pause the video
  // Create a canvas to capture the current frame
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Convert the frame to a data URL
  const frameDataURL = canvas.toDataURL("image/png");
  console.log(frameDataURL);
  // Send the frame to the background script
  if (bool) {
    console.log("Sending frame to background script...");
    const videoId = GetYoutubeVideoId(document.URL);
    if (frame) {
      sendMessageToBackground({
        action: videoId,
        dataURL: frame,
      });
    } else {
      sendMessageToBackground({
        action: videoId,
        dataURL: frameDataURL,
      });
    }
  }
  return frameDataURL;
}

// ===========================Source Code improvision=====================================

function displayAnnotations(data) {
  const video = document.querySelector("video");
  const videoContainer = document.querySelector("#movie_player");

  // Log video dimensions
  console.log("Video Dimensions:", video.offsetWidth, video.offsetHeight);

  data.forEach((item) => {
    // Log received coordinates
    console.log("Received Coordinates:", item.coordinates);

    // Calculate dot positions
    const dotX = item.coordinates[0] * video.offsetWidth;
    const dotY = item.coordinates[1] * video.offsetHeight;

    // Log calculated dot positions
    console.log("Dot Position:", dotX, dotY);

    const dot = document.createElement("div");
    dot.className = "red-dot";
    dot.style.position = "absolute";
    dot.style.left = `${dotX}px`;
    dot.style.top = `${dotY}px`;
    dot.style.width = "10px";
    dot.style.height = "10px";
    dot.style.backgroundColor = "red";
    dot.style.borderRadius = "50%";
    dot.style.cursor = "pointer";
    dot.style.zIndex = "1015";

    // Event listener for hover
    dot.addEventListener("mouseenter", () => {
      // Show sneak peek of the product link
      showSneakPeek(dot, item.link);
    });

    // Event listener for click
    dot.addEventListener("click", () => {
      window.open(item.link, "_blank");
      // Open link in new tab
    });

    videoContainer.insertBefore(dot, videoContainer.firstChild);
  });
}

// ================= Remove All the improvisions =================

function removeAnnotations() {
  const items = document.querySelector("#movie_player");
  const dots = items.querySelectorAll(".red-dot");
  dots.forEach((dot) => {
    dot.remove(); // Removes the dot from the DOM
  });
}

function showSneakPeek(dot, link) {
  const apiKey = "55fb5b570b2b0c5333804062d4ab340f"; // Replace with your actual API key
  const apiUrl = "https://api.linkpreview.net/";

  const urlToPreview = link; // Replace with the URL you want to preview

  // Build the API request URL
  const apiRequestUrl = `${apiUrl}?key=${apiKey}&q=${encodeURIComponent(
    urlToPreview
  )}`;

  // Make a request to the API
  fetch(apiRequestUrl)
    .then((response) => response.json())
    .then((data) => {
      // Process the link preview data
      console.log("Link Preview Data:", data);
      const sneakPeek = document.createElement("div");
      sneakPeek.className = "sneak-peek";
      sneakPeek.style.position = "absolute";
      sneakPeek.style.left = `${dot.offsetLeft}px`;
      sneakPeek.style.top = `${dot.offsetTop}px`;
      console.log(dot.offsetLeft, dot.offsetWidth);
      console.log(dot.offsetTop, dot.offsetHeight);
      sneakPeek.style.backgroundColor = "white";
      sneakPeek.style.padding = "30px";
      sneakPeek.style.borderRadius = "10px";
      sneakPeek.style.boxShadow = "0px 0px 10px 0px rgba(0,0,0,0.75)";
      sneakPeek.style.backgroundColor = "white";
      sneakPeek.style.color = "black";
      sneakPeek.style.opacity = "0.75";
      sneakPeek.style.width = "300px";
      sneakPeek.style.overflow = "hidden";
      sneakPeek.style.display = "flex";
      sneakPeek.style.flexDirection = "column";
      sneakPeek.style.justifyContent = "space-between";
      sneakPeek.style.alignItems = "center";
      sneakPeek.style.gap = "10px";

      sneakPeek.innerHTML = `
       <div style="width:100px; height:100px; background-color:black;">
        <img src="${data.image}" style="height:100%; width:100%; object-fit: cover;"/>
       </div>
        <div style="font-size: 14px; font-weight: bold; margin-top: 10px; color: black;">${data.title}</div>
        <div style="font-size: 12px; color: black;">${data.description}</div>
      `;
      sneakPeek.addEventListener("mouseleave", () => {
        sneakPeek.remove();
      });
      sneakPeek.addEventListener("click", () => {
        window.open(link, "_blank");
      });
      document.body.appendChild(sneakPeek);
    })
    .catch((error) => console.error("Error:", error));
  console.log(dot);
}

// ==========================Sidebar Implementation=============================
function insertSidebar() {
  // Find the video container on the page
  const sidebarParent = document.querySelector("#movie_player");
  sidebarParent.style.position = "relative";
  // Create a div element for the sidebar
  const sidebarElement = document.createElement("div");
  sidebarElement.className = "sidebar";
  sidebarElement.innerHTML = `
      <div class="container-ext">
        <button id="bookmarkButton" type="button" onclick="">
          <img class="image-class" src="${chrome.runtime.getURL(
            "sidebar/bookmarks.png"
          )}" alt="">
        </button>

        <button id="help-circle">
          <img class="image-class" src="${chrome.runtime.getURL(
            "sidebar/help-circle.png"
          )}" alt="">
        </button>

        <button id="settings-sidebar">
          <img class="image-class" src="${chrome.runtime.getURL(
            "sidebar/settings.png"
          )}" alt="">
        </button>
        <button id="setting">
          <img class="image-class image-opacity" src="${chrome.runtime.getURL(
            "images/patreon.png"
          )}" alt="">
        </button>
      </div>
  `;

  // Append the sidebar inside the video container
  sidebarParent.appendChild(sidebarElement);

  // Append settings panel to body
  const settingsPanel = createSettingsPanel();
  document.body.appendChild(settingsPanel);

  // Event listener for settings button
  document.getElementById("settings-sidebar").addEventListener("click", () => {
    toggleElementVisibility(settingsPanel);
  });

  // Event listener for save button in settings panel
  document.getElementById("save-settings").addEventListener("click", () => {
    handleCategoryChange();
    toggleElementVisibility(settingsPanel);
  });

  // Load settings and apply them to checkboxes
  loadSettings(() => {
    document
      .querySelectorAll('#settings-categories input[type="checkbox"]')
      .forEach((checkbox) => {
        checkbox.checked = userSettings.categories.includes(checkbox.value);
        checkbox.addEventListener("change", handleCategoryChange);
      });
  });
}

// Function to insert the sidebar CSS into the page

function logo(state) {
  const sidebarParent = document.querySelector("#movie_player");
  sidebarParent.style.position = "relative";
  const logo = document.createElement("img");
  if (state) {
    logo.src = chrome.runtime.getURL("images/logo_128.png");
  } else {
    logo.src = chrome.runtime.getURL("images/graylogo_128.png");
  }
  logo.style.height = "70px";
  logo.style.width = "70px";
  logo.style.position = "absolute";
  logo.style.top = "10px";
  logo.style.right = "10px";

  const button = document.createElement("button");
  button.style.background = "transparent";
  button.style.border = "none";
  button.appendChild(logo);
  sidebarParent.insertBefore(button, sidebarParent.firstChild);
}

// Function to toggle the sidebar on and off
function toggleSidebar(displayState) {
  const sidebar = document.querySelector(".sidebar");
  const widget = document.querySelector(".container-ext");
  if (sidebar) {
    sidebar.style.display = displayState;
  }
}

// Function to handle video play and pause events
function handleVideoPlayback() {
  const video = document.querySelector("video");
  if (video) {
    video.addEventListener("pause", () => {
      toggleSidebar("flex");
      document.querySelector(".sidebar").style.animationName = "fadeIn";
      captureFrame(true, false);
    });
    video.addEventListener("play", () => {
      document.querySelector(".sidebar").style.animationName = "fadeOut";
      if (document.querySelector(".box")) {
        removeBookMarkSlide();
      }
      //Function call to remove annotations
      removeAnnotations();
      setTimeout(() => {
        toggleSidebar("none");
      }, 500);
    });
  }

  // ==========================BookMark functionality=============================

  //Event listeners for bookmarks
  document.addEventListener("keydown", function (event) {
    if (event.key === "b" || event.key === "B") {
      console.log("Bookmarking current frame saving");
      bookmarkCurrentFrame();
    }
  });
}
// ================= Buttons Implementaion =================

//Event listeners for bookmarks

function bookmarkCurrentFrame() {
  const video = document.querySelector("video");
  if (video) {
    const currentTime = video.currentTime; // Get current time for the bookmark
    captureFrame(false, false).then((frameDataURL) => {
      // Save the bookmark data, for now we'll log it to the console
      //console.log('Bookmark saved at:', currentTime, 'with thumbnail:', frameDataURL);

      const videoId = GetYoutubeVideoId(document.URL);
      saveBookmark({
        time: currentTime,
        thumbnail: frameDataURL,
        Id: videoId,
      });

      // Update the UI with the new bookmark
    });
  }
}

// Function to save a bookmark
function saveBookmark(bookmark) {
  chrome.storage.local.get({ bookmarks: [] }, function (result) {
    const bookmarks = result.bookmarks;
    bookmarks.push(bookmark);
    chrome.storage.local.set({ bookmarks: bookmarks }, function () {
      console.log("Bookmark saved.");
    });
  });
}

function BookMarkSlide() {
  toggleSidebar("none");
  logo(false);
  const sidebar = document.querySelector(".html5-video-container");
  document.querySelector(".ytp-chrome-bottom").style.display = "none";
  const box = document.createElement("div");
  box.className = "box";
  box.id = "box";

  const close = document.createElement("img");
  close.src = chrome.runtime.getURL("images/close.png");
  close.style.height = "20px";
  close.style.width = "20px";
  close.style.position = "absolute";
  close.style.top = "10px";
  close.style.right = "10px";
  close.style.cursor = "pointer";

  const clearAll = document.createElement("Button");
  clearAll.id = "clearAll";
  clearAll.className = "clearAll";
  clearAll.innerHTML = "Clear All";
  clearAll.addEventListener("click", ClearAllBookMarks);
  box.appendChild(clearAll);

  const button = document.createElement("button");
  button.style.background = "transparent";
  button.style.border = "none";
  button.appendChild(close);
  button.addEventListener("click", removeBookMarkSlide);
  box.appendChild(button);
  sidebar.insertAdjacentElement("beforebegin", box);

  console.log("its done");
  RenderBookMarks();
}

function removeBookMarkSlide() {
  const box = document.querySelector(".box");
  if (box) {
    box.remove();
  }
  logo(true);
  document.querySelector(".ytp-chrome-bottom").style.display = "block";
  toggleSidebar("flex");
}

function ClearAllBookMarks() {
  console.log("Clearing all bookmarks");
  chrome.storage.local.clear(function () {
    var error = chrome.runtime.lastError;
    if (error) {
      console.error(error);
    }
  });
  chrome.storage.sync.clear();
  document.querySelector("#Bookmarkedframes").remove();
  RenderBookMarks();
}

function RenderBookMarks() {
  const Bookmarkedframes = document.createElement("div");
  Bookmarkedframes.className = "Bookmarkedframes";
  Bookmarkedframes.id = "Bookmarkedframes";
  box.appendChild(Bookmarkedframes);
  chrome.storage.local.get({ bookmarks: [] }, function (result) {
    if (result.bookmarks.length == 0) {
      clearAll.style.display = "none";
    } else {
      result.bookmarks.forEach((bookmark, index) => {
        const videoID = GetYoutubeVideoId(document.URL);
        if (bookmark.Id === videoID) {
          const numberSlice = Math.abs(bookmark.time).toString();
          // Use Math.abs() to handle negative numbers

          // Return the first four characters of the string
          const number = numberSlice.slice(0, 4);
          const image = document.createElement("div");
          image.setAttribute("id", ``);
          image.setAttribute("data-id", `${index}`);
          image.className = "image";
          image.innerHTML = `
              <button id="ClearbookmarkButton" type="button" >
                <img class="image-class" src="${chrome.runtime.getURL(
                  "images/close.png"
                )}"></button>
              <div class="time">${SecondsToMinutes(bookmark.time)}</div>
              <button class='bookmarkTimeStampButton' id="${index}"> 
              <img  src="${bookmark.thumbnail}" alt="nothing here" />
              </button>
            `;
          Bookmarkedframes.appendChild(image);
        }
      });
    }
    document.querySelector("#box").appendChild(Bookmarkedframes);
    BookMarkTimeStamp();
  });
}

document.querySelectorAll("#ClearbookmarkButton").forEach((button) => {
  console.log(button);
  button.addEventListener("click", function () {
    console.log("Button clicked: " + button.id);
    var buttonId = this.getAttribute("data-button-id");
    console.log("Button clicked: " + buttonId);
    chrome.storage.local.get({ bookmarks: [] }, function (result) {
      const bookmarks = result.bookmarks;
      bookmarks.splice(buttonId, 1);
      chrome.storage.local.set({ bookmarks: bookmarks }, function () {
        console.log("Bookmark saved.");
        RenderBookMarks();
      });
    });
  });
});

function BookMarkTimeStamp() {
  const Buttons = document.querySelectorAll(".bookmarkTimeStampButton");
  for (var i = 0; i < Buttons.length; i++) {
    console.log(Buttons[i].id);
  }
  console.log(Buttons);
  Buttons.forEach((button) => {
    button.addEventListener("click", function () {
      chrome.storage.local.get({ bookmarks: [] }, function (result) {
        result.bookmarks.forEach((bookmark, index) => {
          if (index == button.id) {
            var videoElement = document.querySelector("video");
            videoElement.currentTime = bookmark.time;
            removeAnnotations();
            captureFrame(true, bookmark.thumbnail);
          }
        });
        // Perform actions specific to the clicked button
      });
    });
  });
}

function SecondsToMinutes(time) {
  var minutes = Math.floor(time / 60);
  var seconds = Math.floor(time - minutes * 60);
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  return minutes + ":" + seconds;
}
