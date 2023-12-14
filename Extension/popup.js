// let element = document.getElementById("toggle");
// if (element.innerHTML === "Enable") {
//   chrome.storage.sync.set({ state: false }, function () {
//     console.log("The state is set to false");
//   });
// } else {
//   chrome.storage.sync.set({ state: true }, function () {
//     console.log("The state is set to true");
//   });
// }

// document.getElementById("toggle").addEventListener("click", function () {
//   if (element.innerHTML === "Enable") {
//     document.getElementById("toggle").innerHTML = "Disable";
//     chrome.storage.sync.set({ state: true }, function () {
//       console.log("The state is set to true");
//     });
//   } else {
//     document.getElementById("toggle").innerHTML = "Enable";
//     chrome.storage.sync.set({ state: false }, function () {
//       console.log("The state is set to false");
//     });
//   }
//   getExtensionState(state);
// });

// function getExtensionState(extension) {
//   (async () => {
//     const [tab] = await chrome.tabs.query({
//       active: true,
//       lastFocusedWindow: true,
//     });
//     const response = await chrome.tabs.sendMessage(tab.id, {
//       state: extension,
//     });
//     // do something with response here, not outside the function
//     console.log(response);
//   })();
// }

let extensionState = false;

document.getElementById("toggle").addEventListener("click", function () {
  extensionState = !extensionState;
  if (extensionState) {
    document.getElementById("toggle").innerHTML = "Disable";
  } else {
    document.getElementById("toggle").innerHTML = "Enable";
  }
  getExtensionState();
  chrome.storage.sync.set({ state: extensionState }, function () {
    console.log(extensionState);
  });
});

function getExtensionState() {
  (async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true,
    });
    const response = await chrome.tabs.sendMessage(tab.id, {
      state: extensionState,
    });
    // do something with response here, not outside the function
    console.log(response);
  })();
}
