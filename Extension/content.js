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
    <div class="sidebar">
      <div class="container-ext">
          <img class="image-class" src="${chrome.runtime.getURL('sidebar/bookmarks.png')}" alt="">
          <img class="image-class" src="${chrome.runtime.getURL('sidebar/help-circle.png')}" alt="">
          <img class="image-class" src="${chrome.runtime.getURL('sidebar/settings.png')}" alt="">
      </div>  
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', sidebarHTML);
  }
  
  // Function to insert the sidebar CSS into the page
  function insertSidebarStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .container-ext{
        height: 250px;
        width: 50px;
        background-color: #D6D6D6;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border: 1px solid black;
        border-radius: 20px;
    }
    
    .image-class{
        height: 50px;
        width: 50px;
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