/**
 * Database Configuration
 * Handles MongoDB connection setup
 */

const { MongoClient } = require("mongodb");

const mongoURI = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@cluster0.ya0qxn8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(mongoURI);

let db = null;

const connectDB = async () => {
    try {
        await client.connect();
        db = client.db("car-rental");
        console.log("✅ Connected to MongoDB successfully");
        return db;
    } catch (error) {
        console.error("❌ MongoDB connection error:", error.message);
        process.exit(1);
    }
};

const getDB = () => {
    if (!db) {
        throw new Error("Database not initialized. Call connectDB first.");
    }
    return db;
};

const closeDB = async () => {
    try {
        await client.close();
        console.log("✅ MongoDB connection closed");
    } catch (error) {
        console.error("❌ Error closing MongoDB connection:", error);
    }
};

module.exports = {
    connectDB,
    getDB,
    closeDB,
    client,
};
