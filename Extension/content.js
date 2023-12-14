// content.js

insertSidebar();
insertSidebarStyles();
// Insert the sidebar and its styles when the content script is loaded
// Initially hide tVideoInDBhe sidebar
toggleSidebar("none");
// Start handling video playback events
handleVideoPlayback();

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
    video.pause();

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
  if (video) {
    const videoContainer = document.querySelector(".html5-video-container");
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

      // Event listener for hover
      dot.addEventListener("mouseenter", () => {
        // Show sneak peek of the product link
        showSneakPeek(dot, item.link);
      });

      // Event listener for click
      dot.addEventListener("click", () => {
        window.open(item.link, "_blank"); // Open link in new tab
      });

      videoContainer.appendChild(dot);
    });
  }
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
  sidebarParent.insertBefore(sidebarElement, sidebarParent.firstChild);
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
      top: 150px;
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
    background-color: white;
    opacity: 0.8;
    z-index: 1001;


  }

.Bookmarkedframes {
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: scroll;
  height:75vh;
}

.Bookmarkedframes img {
  padding: 20px;
  width: 200px;
  height: 100px;
  object-fit: cover;

}

.image{
  position: relative;


}
.time {
  font-size: 10px;
  font-weight: bold;
  position: absolute;
  color: black;
  bottom: 20px;
  right: 10px;

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

  //Event listeners for bookmarks
  document.addEventListener("keydown", function (event) {
    if (event.key === "b" || event.key === "B") {
      bookmarkCurrentFrame();
    }
  });

  document
    .getElementById("bookmarkButton")
    .addEventListener("click", bookmarkCurrentFrame);
}

function bookmarkCurrentFrame() {
  const video = document.querySelector("video");
  if (video) {
    const currentTime = video.currentTime; // Get current time for the bookmark
    captureFrame().then((frameDataURL) => {
      // Save the bookmark data, for now we'll log it to the console
      //console.log('Bookmark saved at:', currentTime, 'with thumbnail:', frameDataURL);
      saveBookmark({ time: currentTime, thumbnail: frameDataURL });

      // Update the UI with the new bookmark
      insertBookmarkPanelStyles();
      renderBookmarks();
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

function renderBookmarks() {
  const videoContainer = document.querySelector(".html5-video-container");
  const bookmarksPanel = document.createElement("div");
  bookmarksPanel.className = "bookmarks-panel";

  chrome.storage.local.get({ bookmarks: [] }, function (result) {
    result.bookmarks.forEach((bookmark, index) => {
      const bookmarkThumbnail = document.createElement("div");
      bookmarkThumbnail.className = "bookmark-thumbnail";

      const thumbnailImage = document.createElement("img");
      thumbnailImage.src = bookmark.thumbnail;
      thumbnailImage.className = "thumbnail-image";

      const timestamp = document.createElement("div");
      timestamp.className = "timestamp";
      timestamp.textContent = formatTime(bookmark.time);

      const closeButton = document.createElement("button");
      closeButton.className = "close-button";
      closeButton.textContent = "X";
      closeButton.onclick = function () {
        // Remove this bookmark
        result.bookmarks.splice(index, 1);
        chrome.storage.local.set(
          { bookmarks: result.bookmarks },
          renderBookmarks
        );
      };

      bookmarkThumbnail.appendChild(thumbnailImage);
      bookmarkThumbnail.appendChild(timestamp);
      bookmarkThumbnail.appendChild(closeButton);

      thumbnailImage.onclick = function () {
        document.querySelector("video").currentTime = bookmark.time;
      };

      bookmarksPanel.appendChild(bookmarkThumbnail);
    });
    // If a bookmarks panel already exists, remove it before appending the new one
    const existingPanel = videoContainer.querySelector(".bookmarks-panel");
    if (existingPanel) {
      existingPanel.remove();
    }
    videoContainer.appendChild(bookmarksPanel);
  });
}

function formatTime(seconds) {
  const date = new Date(0);
  date.setSeconds(seconds);
  return date.toISOString().substr(11, 8);
}

// ================= Remove All the improvisions =================

function removeAnnotations() {
  const dots = document.querySelectorAll(".red-dot");
  dots.forEach((dot) => {
    dot.remove(); // Removes the dot from the DOM
  });
}

// ================= Buttons Implementaion =================

//Event listeners for bookmarks
document.addEventListener("keydown", function (event) {
  if (event.key === "b" || event.key === "B") {
    bookmarkCurrentFrame();
  }
});
document
  .getElementById("bookmarkButton")
  .addEventListener("click", bookmarkCurrentFrame);

document
  .getElementById("settings-sidebar")
  .addEventListener("click", BookMarkSlide);

function bookmarkCurrentFrame() {
  const video = document.querySelector("video");
  if (video) {
    const currentTime = video.currentTime; // Get current time for the bookmark
    captureFrame().then((frameDataURL) => {
      console.log("Bookmark saved at:", currentTime, frameDataURL);
      // Save the bookmark data, for now we'll log it to the console
      //console.log('Bookmark saved at:', currentTime, 'with thumbnail:', frameDataURL);
      saveBookmark({ time: currentTime, thumbnail: frameDataURL });

      // Update the UI with the new bookmark
      insertBookmarkPanelStyles();
      renderBookmarks();
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

chrome.storage.local.get({ bookmarks: [] }, function (result) {
  result.bookmarks.forEach((bookmark, index) => {
    if (!bookmark.thumbnail) {
      bookmarks.splice(index, 1);
      console.log("removed bookmark", index);
    }
  });
});

function BookMarkSlide() {
  toggleSidebar("none");
  logo(false);
  const sidebar = document.querySelector(".html5-video-container");
  document.querySelector(".ytp-chrome-bottom").style.display = "none";
  const box = document.createElement("div");
  box.className = "box";
  const Bookmarkedframes = document.createElement("div");
  Bookmarkedframes.className = "Bookmarkedframes";

  chrome.storage.local.get({ bookmarks: [] }, function (result) {
    result.bookmarks.forEach((bookmark, index) => {
      console.log(bookmark.thumbnail);

      const image = document.createElement("div");
      image.className = "image";
      image.innerHTML = `
              <div class="time">${bookmark.time}</div>
              <img src="${bookmark.thumbnail}" alt="nothing here" />
            `;
      Bookmarkedframes.appendChild(image);
    });
    box.appendChild(Bookmarkedframes);
    sidebar.insertAdjacentElement("beforebegin", box);
  });
}

function removeBookMarkSlide() {
  const box = document.querySelector(".box");
  if (box) {
    box.remove();
  }
  toggleSidebar("flex");
  logo(true);
  document.querySelector(".ytp-chrome-bottom").style.display = "block";
}
