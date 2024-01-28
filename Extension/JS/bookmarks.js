/* bookmarks.js */

//Event listeners for bookmarks
document.addEventListener("keydown", function (event) {
    if (event.key === "b" || event.key === "B") {
        bookmarkCurrentFrame();
    }
});

//Event listeners for bookmarks
document
    .getElementById("bookmarkButton")
    .addEventListener("click", BookMarkSlide);

function bookmarkCurrentFrame() {
    const video = document.querySelector("video");
    if (video) {
        const currentTime = video.currentTime; // Get current time for the bookmark
        captureFrame(false).then((frameDataURL) => {
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
                        setTimeout(captureFrame(true), 200);
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
