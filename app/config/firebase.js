import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBXChtYr4A25f-7GukWB-vukPkmtvKUwNA",
    authDomain: "dhub-customer.firebaseapp.com",
    projectId: "dhub-customer",
    storageBucket: "dhub-customer.firebasestorage.app",
    messagingSenderId: "765532412552",
    appId: "1:765532412552:web:b7cd1c824be1c580155d3d",
    measurementId: "G-BNCGCYR3MV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Google Provider Configuration
const googleProvider = new GoogleAuthProvider();

// Add custom parameters to show logged-in accounts
googleProvider.setCustomParameters({
    prompt: 'select_account',
    login_hint: '',
    access_type: 'online',
});

// Add required scopes
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Apple Provider Configuration
const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

// Sign in with Google Popup
export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        const idToken = await user.getIdToken();

        console.log('✅ Google Sign-In Success');
        return { user, idToken };
    } catch (error) {
        console.error('❌ Google Sign-In Error:', error);
        throw error;
    }
};

// Sign in with Apple Popup
export const signInWithApple = async () => {
    try {
        const result = await signInWithPopup(auth, appleProvider);
        const user = result.user;
        const idToken = await user.getIdToken();

        console.log('✅ Apple Sign-In Success');
        return { user, idToken };
    } catch (error) {
        console.error('❌ Apple Sign-In Error:', error);
        throw error;
    }
};

export { auth };
