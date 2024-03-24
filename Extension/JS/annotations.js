/* annotations.js */

function displayAnnotations(data) {
  removeAnnotations();
  data = applyUserSettingsToAnnotations(data);
  const video = document.querySelector("video");
  const videoContainer = document.querySelector("#movie_player");
  var fullscreenButton = document.querySelector(".ytp-fullscreen-button");
  var theatreButton = document.querySelector(".ytp-size-button");

  // Log video dimensions
  console.log("Video Dimensions:", video.offsetWidth, video.offsetHeight); //type -> number

  data.forEach((item) => {
    // Log received coordinates
    console.log("Received Coordinates:", item.coordinates);

    let dotX, dotY;

    if (video.offsetWidth === 935 && video.offsetHeight === 526) {
      //Special case of theatre mode
      dotX = item.coordinates[0] * video.offsetWidth + 295; //295 is difference between theatre mode with and default mode width
      dotY = item.coordinates[1] * video.offsetHeight;
    } else {
      // Calculate dot positions
      dotX = item.coordinates[0] * video.offsetWidth;
      dotY = item.coordinates[1] * video.offsetHeight;
    }

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
      // showSneakPeek(dot, item.link);
      // console.log(item.link);
      // console.log(dot);
    });
    dot.addEventListener("click", () => {
      window.open(item.link, "_blank");
      // Send a POST request to your server
      fetch("https://mongo-backendserver.onrender.com/recordClick", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ link: item.link }),
      })
        .then((response) => response.json())
        .then((data) => console.log("Success:", data))
        .catch((error) => {
          console.error("Error:", error);
        });
    });

    // Event listener for click

    videoContainer.insertBefore(dot, videoContainer.firstChild);
  });

  fullscreenButton.addEventListener("click", function () {
    console.log("Fullscreen button was pressed!");
    removeAnnotations();
  });

  theatreButton.addEventListener("click", function () {
    console.log("Theatre Mode button was pressed!");
    removeAnnotations();
  });
}

function removeAnnotations() {
  const items = document.querySelector("#movie_player");
  const dots = items.querySelectorAll(".red-dot");
  dots.forEach((dot) => {
    dot.remove(); // Removes the dot from the DOM
  });
}
