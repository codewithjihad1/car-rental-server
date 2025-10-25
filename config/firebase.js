/**
 * Firebase Admin Configuration
 * Handles Firebase initialization for authentication
 */

const admin = require("firebase-admin");
const serviceAccount = require("../firebase-adminsdk.json");

const initializeFirebase = () => {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        console.log("✅ Firebase Admin initialized successfully");
    } catch (error) {
        console.error("❌ Firebase initialization error:", error.message);
        process.exit(1);
    }
};

module.exports = {
    initializeFirebase,
    admin,
};
