// auth.js
// Handles authentication logic (Admin login)

let currentFirebaseUser = null;
let authInitialized = false;
let authInitResolve = null;
const authInitPromise = new Promise((resolve) => {
    authInitResolve = resolve;
});

const AuthManager = {
    init: () => {
        if (typeof FirebaseManager !== 'undefined' && FirebaseManager.isActive()) {
            const auth = FirebaseManager.getAuth();
            FirebaseManager.api.onAuthStateChanged(auth, (user) => {
                currentFirebaseUser = user;
                authInitialized = true;
                if (authInitResolve) {
                    authInitResolve();
                    authInitResolve = null;
                }
                // If on admin dashboard and logged out, redirect
                if (!user && window.location.hash === '#admin-dashboard') {
                    window.location.hash = '#admin';
                }
            });
        } else {
            if (authInitResolve) {
                authInitResolve();
                authInitResolve = null;
            }
        }
    },

    waitForAuth: async () => {
        if (authInitialized) return;
        await authInitPromise;
    },

    isAuthenticated: () => {
        return !!currentFirebaseUser;
    },

    login: async (email, password) => {
        try {
            const auth = FirebaseManager.getAuth();
            await FirebaseManager.api.signInWithEmailAndPassword(auth, email, password);
            return true;
        } catch (error) {
            console.error("Firebase login failed:", error);
            return false;
        }
    },

    logout: async () => {
        try {
            const auth = FirebaseManager.getAuth();
            await FirebaseManager.api.signOut(auth);
        } catch (error) {
            console.error("Firebase logout failed:", error);
        }
        window.location.hash = '#admin';
        if(typeof Utils !== 'undefined') Utils.showToast('Logged out successfully');
    }
};
