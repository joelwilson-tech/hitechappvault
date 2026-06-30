(async () => {
    try {
        const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js");
        const { getFirestore } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");
        const { getAuth } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js");
        
        console.log("Firebase SDK imported successfully.");
        
        // Initialize Firebase
        const config = typeof firebaseConfig !== 'undefined' ? firebaseConfig : window.firebaseConfig;
        const app = initializeApp(config);
        const db = getFirestore(app);
        const auth = getAuth(app);
        
        console.log("Firebase initialized successfully.");

        window.FirebaseManager = { 
            isActive: () => true, 
            getApp: () => app,
            getDb: () => db,
            getAuth: () => auth
        };

        window.dispatchEvent(new Event('firebase-ready'));
    } catch (error) {
        console.error("Error initializing Firebase:", error);
    }
})();
