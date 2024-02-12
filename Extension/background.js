// background.js

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action !== "getCategories") {
    const apiUrl = "http://127.0.0.1:5000"; // Flask API
    const data = {
      frameData: request.dataURL,
      movieName: request.action, // Hardcoded for now
    };
    console.log(data);
    // Log the JSON request
    console.log(data);
    fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
        sendResponse({ farewell: "response received", data: data });
      })
      .catch((error) => {
        console.error("Error:", error);
        sendResponse({ farewell: "error", error: error });
      });

    // Indicate that we want to respond asynchronously
    return true;
  } else {
    // Fetch categories from a remote API
    const categoriesUrl = "https://mhfateen.pythonanywhere.com/categories";
    fetch(categoriesUrl)
      .then((response) => response.json())
      .then((data) => {
        if (data && Array.isArray(data.categories)) {
          sendResponse({ categories: data.categories });
        } else {
          // If there is an unexpected response, send an empty array
          sendResponse({ categories: [] });
        }
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
        sendResponse({ categories: [] });
      });

    // Indicate that we want to respond asynchronously
    return true;
  }
  // Add any additional message handling as needed
});
