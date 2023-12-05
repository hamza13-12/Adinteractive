// content.js

// Utility function to send a message to the background script
function sendMessageToBackground(message) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          // If an error occurs, reject the promise
          reject(chrome.runtime.lastError);
        } else {
          // If everything is fine, resolve the promise with the response
          resolve(response);
        }
      });
    });
  }
  
  // Function to capture the current video frame
  async function captureFrame() {
    const video = document.querySelector('video');
    if (video) {
      // Pause the video
      video.pause();
  
      // Create a canvas to capture the current frame
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
      // Convert the frame to a data URL
      const frameDataURL = canvas.toDataURL('image/png');
      console.log("Frame Data:", frameDataURL)
  
      // Send the frame to the background script
      const response = await sendMessageToBackground({
        action: "processFrame",
        dataURL: frameDataURL
      });
  
      // Process the annotations received from the background script
      if (response.annotations) {
        // TODO: Overlay annotations on the video
        console.log(response.annotations);
      }
    }
  }
  
  // Listen for a message from the popup or background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "togglePause") {
      captureFrame().then(sendResponse).catch(console.error);
      return true; // indicates you wish to send a response asynchronously
    }
  });

  // Function to insert the sidebar HTML into the page
  function insertSidebar() {
    // Find the video container on the page
    const sidebarParent = document.querySelector(".html5-video-container")
    
    // Create a div element for the sidebar
    const sidebarElement = document.createElement('div');
    sidebarElement.className = 'sidebar';
    sidebarElement.innerHTML = `
      <div class="container-ext">
          <img class="image-class" src="${chrome.runtime.getURL('sidebar/bookmarks.png')}" alt="">
          <img class="image-class" src="${chrome.runtime.getURL('sidebar/help-circle.png')}" alt="">
          <img class="image-class" src="${chrome.runtime.getURL('sidebar/settings.png')}" alt="">
      </div>
  `;

  // Append the sidebar inside the video container
  sidebarParent.appendChild(sidebarElement);
  }
  
  // Function to insert the sidebar CSS into the page
  function insertSidebarStyles() {
    const style = document.createElement('style');
    style.textContent = `
    .fade-in-image { animation: fadeIn 5s; }

    @keyframes fadeIn {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }    

    .sidebar{
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
    `;
    document.head.appendChild(style);
  }
  
  // Insert the sidebar and its styles when the content script is loaded
  insertSidebarStyles();
  insertSidebar();

  console.log(document.querySelector(".sidebar"))

  // Function to toggle the sidebar on and off
  function toggleSidebar(displayState) {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      sidebar.style.display = displayState;
    }
  }
  
  // Function to handle video play and pause events
  function handleVideoPlayback() {
    const video = document.querySelector('video');
    console.log(video);
    if (video) {
      video.addEventListener('pause', () => toggleSidebar('flex'));
      video.addEventListener('play', () => toggleSidebar('none'));
    }
  }
  
  
  // Initially hide the sidebar
  toggleSidebar('none');
  
  // Start handling video playback events
  handleVideoPlayback();