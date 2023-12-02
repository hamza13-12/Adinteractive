// content.js

// Function to send a message to the background script
function sendMessageToBackground(message) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
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
    const sidebarHTML = `
      <div id="my-extension-sidebar" style="display: none;">
        <a href="#" id="bookmark-icon" class="sidebar-icon">🔖</a>
        <a href="#" id="settings-icon" class="sidebar-icon">⚙️</a>
        <a href="#" id="info-icon" class="sidebar-icon">❓</a>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', sidebarHTML);
  }
  
  // Function to insert the sidebar CSS into the page
  function insertSidebarStyles() {
    const style = document.createElement('style');
    style.textContent = `
      #my-extension-sidebar {
        position: fixed;
        top: 50%;
        left: 0;
        transform: translateY(-50%);
        background: #ffffff;
        border-radius: 0 5px 5px 0;
        box-shadow: 2px 0 5px rgba(0,0,0,0.5);
        padding: 20px 5px;
        box-sizing: border-box;
        display: none;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      }
      .sidebar-icon {
        display: block;
        margin: 8px 0;
        text-decoration: none;
        color: #000000;
        font-size: 24px;
        transition: transform 0.2s ease-in-out;
      }
      .sidebar-icon:hover {
        transform: scale(1.3);
      }
    `;
    document.head.appendChild(style);
  }
  
  // Insert the sidebar and its styles when the content script is loaded
  insertSidebarStyles();
  insertSidebar();
  
  // Function to toggle the sidebar on and off
  function toggleSidebar(displayState) {
    const sidebar = document.getElementById('my-extension-sidebar');
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