// content.js
let lastUrl = document.URL;
new MutationObserver(() => {
  const url = document.URL;
  if (url !== lastUrl) {
    lastUrl = url;
    onUrlChange();
  }
}).observe(document, { subtree: true, childList: true });

function onUrlChange() {
  console.log("URL changed:", lastUrl);
  checkAndExecute(); // Call the function to check conditions and execute if true
}

function checkAndExecute() {
  const videoID = GetYoutubeVideoId(document.URL);
  var DataBaseApi = "https://mhfateen.pythonanywhere.com/check/" + videoID;
  DataBaseApiCallback(DataBaseApi, (isInDatabase, data) => {
    console.log("Video in database:", isInDatabase);
    // Assuming DataBaseApiCallback is async and uses a callback
    chrome.storage.local.get(["enabled"], function (result) {
      const isEnabled = result.enabled || false;

      if (isEnabled && isInDatabase) {
        // Check if both conditions are met
        insertSidebar();
        toggleSidebar("none");
        handleVideoPlayback();
        document
          .getElementById("bookmarkButton")
          .addEventListener("click", BookMarkSlide);
      } else {
        console.log("Extension is disabled or video not in database.");
        removeAnnotations();
        const sidebar = document.querySelector(".sidebar");
        sidebar.remove();
        document.querySelector(".sneak-peek").remove();
        // Add logic here if you need to handle the disabled state or video not in database
      }
    });
  });
}

// Initial check when the script loads
checkAndExecute(); // This will run your checks right away when the script is loaded

// Function to handle changes in the storage
function handleStorageChanges(changes, namespace) {
  for (let key in changes) {
    if (key === "enabled") {
      checkAndExecute(); // Check conditions again if there's a change in the storage
    }
  }
}

// Add an event listener for storage changes
chrome.storage.onChanged.addListener(handleStorageChanges);

// Your existing code that depends on the initial isEnabled value
function DataBaseApiCallback(link, callback) {
  fetch(link)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("API response data:", data);
      // Assuming 'data' contains a field that signifies if the video is in database
      // For example, if your API returns { isInDatabase: true/false }
      callback(data.result, data);
    })
    .catch((error) => {
      console.error("Error making API request:", error);
      callback(false, null); // False here signifies the video is not in the database
    });
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
      //removeAnnotations();
      displayAnnotations(response.data);
    }
    // response is json from api
    // use it to display the pointers on the video
    return response;
  })();
}

// Function to capture the current video frame
// and send it to the background script
async function captureFrame(bool) {
  const video = document.querySelector("video");
  if (video) {
    // Pause the video

    // Create a canvas to capture the current frame
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert the frame to a data URL
    const frameDataURL = canvas.toDataURL("image/png");
    // Send the frame to the background script
    if (bool) {
      sendMessageToBackground({
        action: "processFrame",
        dataURL: frameDataURL,
      });
    }
    return frameDataURL;
  }
}

//------------------------------Utils-----------------------------------------------

// Helper function to toggle visibility
function toggleElementVisibility(element) {
  element.style.display = element.style.display === "none" ? "block" : "none";
}

function GetYoutubeVideoId(URL) {
  var video_id = URL.split("v=")[1];
  var ampersandPosition = video_id.indexOf("&");
  if (ampersandPosition != -1) {
    video_id = video_id.substring(0, ampersandPosition);
  }
  return video_id;
}

//-----------------------------Create Settings Panel------------------------------------

getCategoriesFromBackgroundScript()
  .then((categories) => {
    const settingsPanel = createSettingsPanel(categories);
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
function insertSidebarStyles() {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes fadeIn {
      0% {
        transform: translateX(-70px);
      }
      100% {

        transform: translateX(0px);
    }}

    @keyframes fadeOut {
      0% {
        transform: translateX(0px);
      }
      100% {
        transform: translateX(-70px);
    }}

    .sidebar{
      animation: fadeIn 0.5s;
      position: absolute;
      top: 30%;
      z-index: 1000;
    }

    .container-ext{
        width: 20px;
        margin-left: 1rem;
        background-color: #d6d6d6bf;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 30px;
        align-items: center;
        padding: 20px;
        border-radius: 20px;
    }
    
    .image-class{
        height: 25px;
        width: 25px;
    }
    .image-opacity{
      opacity: 0.5;
    }
    container-ext, button{
      background-color: transparent;
      border: none;

    }
    container-ext, button:hover{
      cursor: pointer;
    }
  .box {
    position: absolute;
    top: 14px;
    right: 0px;
    background-color: #d6d6d6bf;
    z-index: 1001;
    border-radius: 20px 0px 0px 20px;
    width: 200px;
    padding:25px;
    height: 100vh;
  }

.Bookmarkedframes {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  overflow: scroll;
  height:66vh;
  margin-top: 34px;
  padding: 20px;
}

.Bookmarkedframes img {
  width: 200px;
  height: 100px;
}

.image{
  position: relative;


}
.time {
  font-size: 15px;
  font-weight: bold;
  color: white;
  position: absolute;
  bottom: 9px;
  right: 12px;

}
.Bookmarkedframes::-webkit-scrollbar {
  display: none;
}

.clearAll{
  position: absolute;
  top: 10px;
  left: 10px;
  cursor: pointer;
  border: 1px solid black;
  border-radius: 20px;
  padding: 10px;
  color: black;
  display:block;
}

#ClearbookmarkButton{
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
  border: 1px solid black;
  border-radius: 20px;
  color: black;
  display:block;
  background-color: transparent;
  border: none;
  z-index: 1003;
}
#ClearbookmarkButton img{
    width: 20px;
  height: 20px;
}
.BookMarkButtonClasses{

}

#settings-panel {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  background-color: #fff;
  box-shadow: 0 0 5px rgba(0,0,0,0.2);
  padding: 10px;
  border-radius: 5px;
  z-index: 1001; /* Ensure it's above other elements */
}

#settings-panel h3 {
  margin-top: 0;
}

#settings-categories label {
  display: block;
  margin-bottom: 5px;
}

#settings-categories input[type='checkbox'] {
  margin-right: 5px;
}

#save-settings {
  display: inline-block;
  margin-top: 10px;
  cursor: pointer;
}
`;
  document.head.appendChild(style);
}
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

if (VideoInDB) {
  logo(true);
} else {
  logo(false);
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
      captureFrame(true);
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

    video.addEventListener("seeked", () => {
      if (video.paused) {
        removeAnnotations();
        captureFrame(true);
      }
    });
  }
}
