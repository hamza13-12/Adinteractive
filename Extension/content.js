// content.js

function sendMessageToBackground(message) {
  (async () => {
    const response = await chrome.runtime.sendMessage(message);
    console.log(response);
    // response is json from api
    // use it to display the pointers on the video
  })();
}

// Function to capture the current video frame
async function captureFrame() {
  const video = document.querySelector("video");
  if (video) {
    // Pause the video
    video.pause();

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
    sendMessageToBackground({
      action: "processFrame",
      dataURL: frameDataURL,
    });
  }
}

// Listen for a message from the popup or background script

// Function to insert the sidebar HTML into the page
function insertSidebar() {
  // Find the video container on the page
  const sidebarParent = document.querySelector(".html5-video-container");

  // Create a div element for the sidebar
  const sidebarElement = document.createElement("div");
  sidebarElement.className = "sidebar";
  sidebarElement.innerHTML = `
      <div class="container-ext">
        <button id="bookmarkButton" type="button" onclick="bookmarkfunction()">
          <img class="image-class" src="${chrome.runtime.getURL(
            "sidebar/bookmarks.png"
          )}" alt="">
        </button>

        <button id="help-circle">
          <img class="image-class" src="${chrome.runtime.getURL(
            "sidebar/help-circle.png"
          )}" alt="">
        </button>

        <button id="setting">
          <img class="image-class" src="${chrome.runtime.getURL(
            "sidebar/settings.png"
          )}" alt="">
        </button>
      </div>
  `;

  // Append the sidebar inside the video container
  sidebarParent.appendChild(sidebarElement);
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
      position: relative;
      top: 150px;
    }

    .container-ext{
        height: 150px;
        width: 20px;
        margin-left: 1rem;
        background-color: #d6d6d6bf;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-radius: 20px;
    }
    
    .image-class{
        height: 25px;
        width: 25px;
    }
    container-ext, button{
      background-color: transparent;
      border: none;
      z-index: 1000;
    }
    container-ext, button:hover{
      cursor: pointer;
    }
    `;
  document.head.appendChild(style);
}

// Insert the sidebar and its styles when the content script is loaded
insertSidebarStyles();
insertSidebar();

console.log(document.querySelector(".sidebar"));

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
      captureFrame();
    });
    video.addEventListener("play", () => {
      document.querySelector(".sidebar").style.animationName = "fadeOut";

      setTimeout(() => {
        toggleSidebar("none");
      }, 500);
    });
  }
}

// Initially hide the sidebar
toggleSidebar("none");

// Start handling video playback events
handleVideoPlayback();
