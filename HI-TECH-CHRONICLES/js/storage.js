// storage.js - Read-only data access layer for Firestore

window.storage = {
    // Helper to get Firestore functions since they are loaded dynamically
    async getFirestoreFuncs() {
        return await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");
    },

    async getAll(collectionName) {
        if (!window.FirebaseManager || !window.FirebaseManager.getDb()) {
            console.warn("Firestore not initialized.");
            return [];
        }
        try {
            const { collection, getDocs, query, orderBy } = await this.getFirestoreFuncs();
            const db = window.FirebaseManager.getDb();
            // Default ordering by a common field if it exists, otherwise just getDocs
            // For this basic shell, we'll just fetch all. Real app might want specific ordering.
            const q = query(collection(db, collectionName));
            const querySnapshot = await getDocs(q);
            const items = [];
            querySnapshot.forEach((doc) => {
                items.push({ id: doc.id, ...doc.data() });
            });
            return items;
        } catch (error) {
            console.error(`Error fetching collection ${collectionName}:`, error);
            return []; // Graceful failure
        }
    },

    async getById(collectionName, id) {
        if (!window.FirebaseManager || !window.FirebaseManager.getDb()) {
            console.warn("Firestore not initialized.");
            return null;
        }
        try {
            const { doc, getDoc } = await this.getFirestoreFuncs();
            const db = window.FirebaseManager.getDb();
            const docRef = doc(db, collectionName, id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            } else {
                return null;
            }
        } catch (error) {
            console.error(`Error fetching document ${id} from ${collectionName}:`, error);
            return null; // Graceful failure
        }
    },

    async incrementAppDownload(id) {
        if (!window.FirebaseManager || !window.FirebaseManager.getDb()) {
            console.warn("Firestore not initialized.");
            return false;
        }
        try {
            const { doc, updateDoc, increment } = await this.getFirestoreFuncs();
            const db = window.FirebaseManager.getDb();
            const docRef = doc(db, 'apps', id);
            await updateDoc(docRef, {
                downloadCount: increment(1)
            });
            return true;
        } catch (error) {
            console.error(`Error incrementing download for app ${id}:`, error);
            return false; // Graceful failure
        }
    },

    async _checkAuth() {
        if (!window.FirebaseManager || !window.FirebaseManager.getAuth()) return false;
        const auth = window.FirebaseManager.getAuth();
        return !!auth.currentUser;
    },

    async create(collectionName, data) {
        if (!(await this._checkAuth())) {
            console.error("Unauthorized: Must be logged in to create data.");
            return null;
        }
        try {
            const { collection, addDoc } = await this.getFirestoreFuncs();
            const db = window.FirebaseManager.getDb();
            const docRef = await addDoc(collection(db, collectionName), data);
            return docRef.id;
        } catch (error) {
            console.error(`Error creating document in ${collectionName}:`, error);
            return null;
        }
    },

    async update(collectionName, id, data) {
        if (!(await this._checkAuth())) {
            console.error("Unauthorized: Must be logged in to update data.");
            return false;
        }
        try {
            const { doc, updateDoc, setDoc } = await this.getFirestoreFuncs();
            const db = window.FirebaseManager.getDb();
            const docRef = doc(db, collectionName, id);
            
            // If it's the settings document, it might not exist yet, so we should use setDoc with merge for it.
            // But for simplicity, the prompt asks for update. For settings, we can just use setDoc with merge:true.
            if (collectionName === 'settings' && id === 'global') {
                await setDoc(docRef, data, { merge: true });
            } else {
                await updateDoc(docRef, data);
            }
            return true;
        } catch (error) {
            console.error(`Error updating document ${id} in ${collectionName}:`, error);
            return false;
        }
    },

    async remove(collectionName, id) {
        if (!(await this._checkAuth())) {
            console.error("Unauthorized: Must be logged in to delete data.");
            return false;
        }
        try {
            const { doc, deleteDoc } = await this.getFirestoreFuncs();
            const db = window.FirebaseManager.getDb();
            const docRef = doc(db, collectionName, id);
            await deleteDoc(docRef);
            return true;
        } catch (error) {
            console.error(`Error deleting document ${id} from ${collectionName}:`, error);
            return false;
        }
    }
};
