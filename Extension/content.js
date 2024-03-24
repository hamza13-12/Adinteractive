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

    chrome.storage.local.get(["enabled", "loggedIn"], function (result) {
      var isEnabled = result.enabled || false;
      var isLoggedIn = result.loggedIn || false; // Get the loggedIn state
      console.log("Extension enabled in check:", isEnabled);
      console.log("User logged in check:", isLoggedIn); // Log the loggedIn state for debugging
      logo();
      if (isInDatabase === true) {
        document.querySelector("#Adinteractive-logo").src =
          chrome.runtime.getURL("images/logo_128.png");
      } else {
        document.querySelector("#Adinteractive-logo").src =
          chrome.runtime.getURL("images/graylogo_128.png");
      }

      if (isEnabled && isInDatabase && isLoggedIn) {
        // Check if both conditions are met
        insertSidebar();
        toggleSidebar("none");

        document
          .getElementById("bookmarkButton")
          .addEventListener("click", BookMarkSlide);

        getCategoriesFromBackgroundScript()
          .then((categories) => {
            const settingsPanel = createSettingsPanel(categories); // This function should return the created settings panel element
            document.body.appendChild(settingsPanel);

            loadSettings(() => {
              document
                .querySelectorAll('#settings-categories input[type="checkbox"]')
                .forEach((checkbox) => {
                  checkbox.checked = userSettings.categories.includes(
                    checkbox.value
                  );
                  checkbox.addEventListener("change", handleCategoryChange);
                });
            });

            // Now that the settingsPanel is confirmed to be in the DOM, we can safely add the event listener
            document
              .getElementById("settings-sidebar")
              .addEventListener("click", () => {
                updatePanelPosition();
                toggleElementVisibility(settingsPanel);
              });

            document
              .getElementById("save-settings")
              .addEventListener("click", () => {
                handleCategoryChange();
                toggleElementVisibility(settingsPanel);
              });

            // Save settings event listener

            // Here you can also safely add any other event listeners related to the sidebar
          })
          .catch((error) => {
            console.error("Could not create settings panel:", error);
          });
      } else {
        console.log("Extension is disabled or video not in database.");
        removeAnnotations();
        if (document.querySelector(".sidebar")) {
          document.querySelector(".sidebar").remove();
        }
        if (document.querySelector(".sneak-peek")) {
          document.querySelector(".sneak-peek").remove();
        }

        // Add logic here if you need to handle the disabled state or video not in database
      }

      handleVideoPlayback();
    });
  });
}

// Initial check when the script loads
checkAndExecute(); // This will run your checks right away when the script is loaded

// Function to handle changes in the storage
function handleStorageChanges(changes, namespace) {
  for (let key in changes) {
    if (key === "enabled" || key === "loggedIn") {
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

// ===============================Communication with Background Script========================================

async function getCategoriesFromBackgroundScript() {
  try {
    // Wrap chrome.runtime.sendMessage in a Promise
    const response = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { action: "getCategories" },
        function (response) {
          if (chrome.runtime.lastError) {
            // Handle potential errors
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            // Resolve the promise with the response
            resolve(response);
          }
        }
      );
    });

    // Handle the response from the background script
    console.log(
      "Response from background script on categories:",
      response.categories
    );
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
    if (bool === true) {
      const videoID = GetYoutubeVideoId(document.URL);

      sendMessageToBackground({
        timestamp: video.currentTime,
        action: videoID,
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
// Function to handle video play and pause events
function handleVideoPlayback() {
  const video = document.querySelector("video");
  if (video) {
    // Only proceed if the extension is enabled
    // Check if event listeners have already been added
    if (!video.dataset.videoListenersAdded) {
      // Add event listeners only if they haven't been added before
      video.addEventListener("pause", (e) => {
        toggleSidebar("flex");
        try {
          document.querySelector(".sidebar").style.animationName = "fadeIn";
        } catch (error) {
          // console.log("Extension could not find the sidebar");
        }

        chrome.storage.local.get(["enabled", "loggedIn"], function (result) {
          var isEnabled = result.enabled || false;
          var isLoggedIn = result.loggedIn || false;
          console.log("idk why capture frame is working enabled", isEnabled);
          if (isEnabled === true && isLoggedIn === true) {
            captureFrame(true);
          } // Pass isEnabled to handleVideoPlayback
        });
      });
      video.addEventListener("play", () => {
        try {
          document.querySelector(".sidebar").style.animationName = "fadeOut";
        } catch (error) {
          // console.log("Extension could not find the sidebar");
        }
        if (document.querySelector(".box")) {
          removeBookMarkSlide();
        }

        //Function call to remove annotations
        removeAnnotations();
        setTimeout(() => {
          toggleSidebar("none");
        }, 500);
      });
      video.dataset.videoListenersAdded = true; // Mark event listeners as added
    }

    video.addEventListener("seeked", () => {
      if (video.paused) {
        removeAnnotations();
        captureFrame(true);
      }
    });
  }
}

// Function to insert the sidebar
