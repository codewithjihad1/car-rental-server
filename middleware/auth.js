/**
 * Authentication Middleware
 * Handles Firebase token verification and email verification
 */

const { admin } = require("../config/firebase");

/**
 * Verify Firebase ID Token Middleware
 * Validates the Firebase authentication token from request headers
 */
const verifyFirebaseToken = async (req, res, next) => {
    const idToken = req.headers.authorization?.split("Bearer ")[1];

    if (!idToken) {
        return res
            .status(401)
            .send({ error: "Unauthorized - No token provided" });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.decoded = decodedToken;
        next();
    } catch (error) {
        console.error("Error verifying Firebase ID token:", error);
        res.status(401).send({ error: "Unauthorized - Invalid token" });
    }
};

/**
 * Verify User Email Middleware
 * Ensures the requesting user's email matches the decoded token email
 */
const verifyTokenEmail = async (req, res, next) => {
    const email = req.query.userEmail;

    if (!email) {
        return res
            .status(400)
            .send({ error: "Email query parameter is required" });
    }

    if (email !== req.decoded.email) {
        return res.status(403).send({ error: "Forbidden - Email mismatch" });
    }

    next();
};

module.exports = {
    verifyFirebaseToken,
    verifyTokenEmail,
};
