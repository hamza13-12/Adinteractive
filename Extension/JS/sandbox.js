// sandbox.js

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCjP0usZzVWEtPL-sT81Pj9WRg5051L-CA",
    authDomain: "adinteractive-5da1a.firebaseapp.com",
    projectId: "adinteractive-5da1a",
    storageBucket: "adinteractive-5da1a.appspot.com",
    messagingSenderId: "1028892277609",
    appId: "1:1028892277609:web:0e2dd55d29ed8d161d1bf8",
    measurementId: "G-HB9KXEC41X"
};

function ensureFirebaseInitialized() {
    if (!firebase.apps.length) {
        return firebase.initializeApp(firebaseConfig);
    }
    return firebase.app(); // If already initialized, use that one
}

// Listen for messages from the parent page
window.addEventListener('message', (event) => {
    if (event.origin === window.location.origin) {
        // Ensure Firebase is initialized for any incoming message
        try {
            const app = ensureFirebaseInitialized();
            console.log("Firebase is ensured to be initialized in the sandbox:", app.name);
        } catch (initError) {
            console.error("Firebase initialization error in the sandbox:", initError);
            event.source.postMessage({
                type: 'firebase-initialization-failed',
                error: initError.message
            }, event.origin);
            return;
        }

        // Handle different types of messages
        switch (event.data.type) {
            case 'login-request':
                handleLoginRequest(event.data, event.source, event.origin);
                break;
            case 'signup-request':
                handleSignupRequest(event.data, event.source, event.origin);
                break;
            // Add more cases for other message types as needed
        }
    }
});

function handleLoginRequest(data, source, origin) {
    const { email, password } = data;
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            if (userCredential && userCredential.user) {
                // Login successful: Post message back to login page with user details
                source.postMessage({
                    type: 'login-response',
                    success: true,
                    user: userCredential.user.toJSON() // Serialize the user object
                }, origin);
            } else {
                throw new Error('The user data is not available after login.');
            }
        })
        .catch((loginError) => {
            console.error("Login error in the sandbox:", loginError);
            // Login failed: Post message back to login page with error details
            source.postMessage({
                type: 'login-response',
                success: false,
                error: loginError.message
            }, origin);
        });
}

function handleSignupRequest(data, source, origin) {
    const { email, password, name } = data;
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            if (userCredential && userCredential.user) {
                // Optionally set the user's display name
                return userCredential.user.updateProfile({ displayName: name }).then(() => userCredential);
            } else {
                throw new Error('The user data is not available after signup.');
            }
        })
        .then((userCredential) => {
            // Signup successful: Post message back to signup page with success status
            source.postMessage({
                type: 'signup-response',
                success: true,
                user: userCredential.user.toJSON() // Serialize the user object
            }, origin);
        })
        .catch((signupError) => {
            console.error("Signup error in the sandbox:", signupError);
            // Signup failed: Post message back to signup page with error details
            source.postMessage({
                type: 'signup-response',
                success: false,
                error: signupError.message
            }, origin);
        });
}
