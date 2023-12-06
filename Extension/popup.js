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
