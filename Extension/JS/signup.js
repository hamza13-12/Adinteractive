document.addEventListener('DOMContentLoaded', () => {
    const signupButton = document.getElementById('signup-btn');
    const signupEmail = document.getElementById('signup-email');
    const signupPassword = document.getElementById('signup-password');
    const signupName = document.getElementById('signup-name');
    const logoImage = document.getElementById('logo');
    const firebaseSandboxIframe = document.getElementById('firebase-sandbox');
    const errorDisplay = document.getElementById('signup-error');

    if (!errorDisplay) {
        console.error('The error display element #signup-error does not exist in the DOM.');
        return;
    }

    if (logoImage) {
        logoImage.src = chrome.runtime.getURL("images/logo_128.png");
    } else {
        console.error('The logo element #logo does not exist in the DOM.');
    }

    signupButton.addEventListener('click', () => {
        const email = signupEmail.value.trim();
        const password = signupPassword.value.trim();
        const name = signupName.value.trim();

        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            errorDisplay.textContent = 'Please enter a valid email address.';
            return;
        }

        if (password.length < 6) {
            errorDisplay.textContent = 'Password must be at least 6 characters long.';
            return;
        }

        if (!name) {
            errorDisplay.textContent = 'Please enter your name.';
            return;
        }

        signupButton.disabled = true;
        errorDisplay.textContent = '';

        firebaseSandboxIframe.contentWindow.postMessage({
            type: 'signup-request',
            email: email,
            password: password,
            name: name
        }, '*');
    });

    window.addEventListener('message', function (event) {
        if (event.data && event.data.type === 'signup-response') {
            signupButton.disabled = false;

            if (event.data.success) {
                console.log("Signup successful");
                signupEmail.value = '';
                signupPassword.value = '';
                signupName.value = '';
                errorDisplay.textContent = 'Signup successful! Redirecting to login...';
                setTimeout(() => { window.location.href = 'login.html'; }, 3000);
            } else {
                console.error("Signup failed", event.data.error);
                errorDisplay.textContent = event.data.error;
            }
        }

    });

    const showLoginButton = document.getElementById('show-login-btn');
    showLoginButton.addEventListener('click', () => {
        window.location.href = 'login.html';
    });
});
