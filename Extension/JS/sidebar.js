/* sidebar.js */

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
}

// Function to toggle the sidebar on and off
function toggleSidebar(displayState) {
    const sidebar = document.querySelector(".sidebar");
    const widget = document.querySelector(".container-ext");
    if (sidebar) {
        sidebar.style.display = displayState;
    }
}