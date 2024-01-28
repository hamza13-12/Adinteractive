/* annotations.js */

function displayAnnotations(data) {
    data = applyUserSettingsToAnnotations(data);
    const video = document.querySelector("video");
    const videoContainer = document.querySelector("#movie_player");

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

        videoContainer.insertBefore(dot, videoContainer.firstChild);
    });
}

// ================= Remove All the improvisions =================

function removeAnnotations() {
    const items = document.querySelector("#movie_player");
    const dots = items.querySelectorAll(".red-dot");
    dots.forEach((dot) => {
        dot.remove(); // Removes the dot from the DOM
    });
}

function showSneakPeek(dot, link) {
    const apiKey = "55fb5b570b2b0c5333804062d4ab340f"; // Replace with your actual API key
    const apiUrl = "https://api.linkpreview.net/";

    const urlToPreview = link; // Replace with the URL you want to preview

    // Build the API request URL
    const apiRequestUrl = `${apiUrl}?key=${apiKey}&q=${encodeURIComponent(
        urlToPreview
    )}`;

    // Make a request to the API
    fetch(apiRequestUrl)
        .then((response) => response.json())
        .then((data) => {
            // Process the link preview data
            console.log("Link Preview Data:", data);
            const sneakPeek = document.createElement("div");
            sneakPeek.className = "sneak-peek";
            sneakPeek.style.position = "absolute";
            sneakPeek.style.left = `${dot.offsetLeft + dot.offsetWidth}px`;
            sneakPeek.style.top = `${dot.offsetTop}px`;
            sneakPeek.style.backgroundColor = "white";
            sneakPeek.style.padding = "30px";
            sneakPeek.style.borderRadius = "10px";
            sneakPeek.style.boxShadow = "0px 0px 10px 0px rgba(0,0,0,0.75)";
            sneakPeek.style.backgroundColor = "white";
            sneakPeek.style.color = "black";
            sneakPeek.style.opacity = "0.75";
            sneakPeek.style.zIndex = "1010";
            sneakPeek.style.cursor = "pointer";
            sneakPeek.style.width = "300px";
            sneakPeek.style.overflow = "hidden";
            sneakPeek.style.display = "flex";
            sneakPeek.style.flexDirection = "column";
            sneakPeek.style.justifyContent = "space-between";
            sneakPeek.style.alignItems = "center";
            sneakPeek.style.gap = "10px";

            sneakPeek.innerHTML = `
         <div style="width:100px; height:100px; background-color:black;">
          <img src="${data.image}" style="height:100%; width:100%; object-fit: cover;"/>
         </div>
          <div style="font-size: 14px; font-weight: bold; margin-top: 10px; color: black;">${data.title}</div>
          <div style="font-size: 12px; color: black;">${data.description}</div>
        `;
            sneakPeek.addEventListener("mouseleave", () => {
                sneakPeek.remove();
            });

            document.body.appendChild(sneakPeek);
        })
        .catch((error) => console.error("Error:", error));
    console.log(dot);
}