// content.js

insertSidebar();
insertSidebarStyles();
// Insert the sidebar and its styles when the content script is loaded
// Initially hide tVideoInDBhe sidebar
toggleSidebar("none");
// Start handling video playback events
handleVideoPlayback();

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
async function captureFrame() {
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
    sendMessageToBackground({
      action: "processFrame",
      dataURL: frameDataURL,
    });
    return frameDataURL;
  }
}

// ===========================Source Code improvision=====================================

function displayAnnotations(data) {
  const video = document.querySelector("video");
  const videoContainer = document.querySelector("#movie_player");
  const dots = document.createElement("div");
  dots.className = "dot-class";

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
    dot.style.zIndex = "1010";

    // Event listener for hover
    dot.addEventListener("mouseenter", () => {
      // Show sneak peek of the product link
      showSneakPeek(dot, item.link);
    });

    // Event listener for click
    dot.addEventListener("click", () => {
      window.open(item.link, "_blank"); // Open link in new tab
    });

    dots.appendChild(dot);
  });
  videoContainer.insertBefore(dots, videoContainer.firstChild);
}

// ================= Remove All the improvisions =================

function removeAnnotations() {
  const dots = document.querySelectorAll(".dot-class");
  dots.forEach((dot) => {
    dot.remove(); // Removes the dot from the DOM
  });
}

function showSneakPeek(dot, link) {}
// Implement function to show sneak peek of the product link
// This could be a tooltip or a small popup near the dot
//Refer to figma design for more details
// Logo Function to insert the logo HTML into the page
// Function to insert the sidebar HTML into the page

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

  // Position the sidebar 
  updateSidebarPosition();
}

function updateSidebarPosition() {
  let videoElement = document.querySelector('.html5-main-video');
  let sidebarElement = document.querySelector('.sidebar');
  let parentElement = videoElement.closest('.html5-video-player');

  if (videoElement && sidebarElement && parentElement) {
    const videoMidpoint = parentElement.offsetHeight / 2;
    const sidebarMidpoint = sidebarElement.offsetHeight / 2;

    const newTop = videoMidpoint - sidebarMidpoint;
    console.log("Calculated newTop for sidebar:", newTop);

    sidebarElement.style.top = `${newTop}px`;
  }
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
      transform: translateY(-50%);
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

}`;
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
      updateSidebarPosition();
      toggleSidebar("flex");
      document.querySelector(".sidebar").style.animationName = "fadeIn";
      captureFrame();
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
      bookmarkCurrentFrame();
    }
  });
}
// ================= Buttons Implementaion =================

//Event listeners for bookmarks
document
  .getElementById("bookmarkButton")
  .addEventListener("click", BookMarkSlide);

function bookmarkCurrentFrame() {
  const video = document.querySelector("video");
  if (video) {
    const currentTime = video.currentTime; // Get current time for the bookmark
    captureFrame().then((frameDataURL) => {
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

function RemoveSingleBookMark() {
  document.querySelectorAll("#").forEach((button) => {
    button.addEventListener("click", function () {
      var buttonId = this.getAttribute("data-button-id");
      // console.log("Button clicked: " + buttonId);
      // Perform actions specific to the clicked button
    });
  });
}

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
            setTimeout(captureFrame, 50);
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

function SecondsToMinutes(time) {
  var minutes = Math.floor(time / 60);
  var seconds = Math.floor(time - minutes * 60);
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  return minutes + ":" + seconds;
}