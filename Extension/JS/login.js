// login.js

document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('login-btn');
    const loginEmail = document.getElementById('login-email');
    const loginPassword = document.getElementById('login-password');
    const showSignupButton = document.getElementById('show-signup-btn');
    const logoImage = document.getElementById('logo');
    const firebaseSandboxIframe = document.getElementById('firebase-sandbox');

    // Set the logo image source
    logoImage.src = chrome.runtime.getURL("images/logo_128.png");

    loginButton.addEventListener('click', () => {
        const email = loginEmail.value.trim();
        const password = loginPassword.value.trim();

        // Disable login button to prevent multiple clicks
        loginButton.disabled = true;

        // Send message to sandbox for login
        firebaseSandboxIframe.contentWindow.postMessage({
            type: 'login-request',
            email: email,
            password: password
        }, '*');
    });

    // Listen for login response messages from the sandbox
    window.addEventListener('message', function (event) {
        if (event.data && event.data.type === 'login-response') {
            loginButton.disabled = false; // Re-enable the login button

            if (event.data.success) {
                console.log("Login successful", event.data.user);

                // Save the logged-in state
                chrome.storage.local.set({ loggedIn: true }, () => {
                    console.log("User logged in state saved.");
                });

                // Redirect to the popup page
                window.location.href = 'popup.html';
            } else {
                console.error("Login failed", event.data.error);
                // Show error message to the user
                // Ensure you have a div or some element to show errors to the user
                document.getElementById('login-error').textContent = event.data.error;
            }
        }
    });

    showSignupButton.addEventListener('click', () => {
        window.location.href = 'signup.html'; // Redirect to signup page
    });
});
