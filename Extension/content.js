// content.js

insertSidebar();
// Insert the sidebar and its styles when the content script is loaded
// Initially hide tVideoInDBhe sidebar
toggleSidebar("none");
// Start handling video playback events
handleVideoPlayback();

// ==================================Communication with Background Script========================================

async function getCategoriesFromBackgroundScript() {
  try {
    // Wrap chrome.runtime.sendMessage in a Promise
    const response = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: "getCategories" }, function (response) {
        if (chrome.runtime.lastError) {
          // Handle potential errors
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          // Resolve the promise with the response
          resolve(response);
        }
      });
    });

    // Handle the response from the background script
    console.log("Response from background script on categories:", response.categories);
    return response.categories;
  } catch (error) {
    // Handle any errors that occur during the message sending
    console.error("Error in getCategoriesFromBackgroundScript:", error);
    return [];
  }
}

function sendMessageToBackground(message) {
  (async () => {
    const response = await chrome.runtime.sendMessage(message);
    console.log(response);
    if (response && response.data) {
      console.log("Response from Frame API:", response)
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
  element.style.display = element.style.display === 'none' ? 'block' : 'none';
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

getCategoriesFromBackgroundScript().then(categories => {
  const settingsPanel = createSettingsPanel(categories);
  document.body.appendChild(settingsPanel);

  loadSettings(() => {
    document.querySelectorAll('#settings-categories input[type="checkbox"]').forEach(checkbox => {
      checkbox.checked = userSettings.categories.includes(checkbox.value);
      checkbox.addEventListener('change', handleCategoryChange);
    });
  });

  document.getElementById('settings-sidebar').addEventListener('click', () => {
    updatePanelPosition();
    toggleElementVisibility(settingsPanel);
  });

  document.getElementById('save-settings').addEventListener('click', () => {
    handleCategoryChange();
    toggleElementVisibility(settingsPanel);
  });

}).catch(error => {
  console.error("Could not create settings panel:", error);
});

//--------------------------Handle Video Playback Events------------------------------

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

