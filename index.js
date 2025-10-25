/**
 * Main Server Entry Point
 * Car Rental API Server
 *
 * This is the main entry point of the application.
 * All configurations, middleware, and routes are initialized here.
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");

// Import configurations
const { initializeFirebase } = require("./config/firebase");
const { connectDB, getDB, closeDB } = require("./config/database");

// Import routes
const carsRoutes = require("./routes/carsRoutes");
const bookingsRoutes = require("./routes/bookingsRoutes");

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Firebase
initializeFirebase();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/", (req, res) => {
    res.send({
        status: "success",
        message: "🚗 Car Rental API Server is running",
        version: "1.0.0",
        endpoints: {
            cars: "/api/cars",
            bookings: "/api/bookings",
            health: "/health",
        },
    });
});

// Health check endpoint
app.get("/health", (req, res) => {
    res.send({
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

// Initialize database and start server
const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();
        const db = getDB();

        // Get collections
        const carsCollection = db.collection("cars");
        const bookingsCollection = db.collection("bookings");
        const couponsCollection = db.collection("coupons");

        // Initialize default coupons if collection is empty
        const couponCount = await couponsCollection.countDocuments();
        if (couponCount === 0) {
            const { DEFAULT_COUPONS } = require("./models/coupons");
            await couponsCollection.insertMany(DEFAULT_COUPONS);
            console.log("✅ Default coupons initialized");
        }

        // Initialize routes
        app.use("/api/cars", carsRoutes(carsCollection));
        app.use(
            "/api/bookings",
            bookingsRoutes(
                bookingsCollection,
                carsCollection,
                couponsCollection
            )
        );

        // 404 handler
        app.use((req, res) => {
            res.status(404).send({
                error: "Route not found",
                message: `Cannot ${req.method} ${req.path}`,
            });
        });

        // Global error handler
        app.use((err, req, res, next) => {
            console.error("Unhandled error:", err);
            res.status(500).send({
                error: "Internal server error",
                message: err.message,
            });
        });

        // Start the server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("❌ Failed to start server:", error.message);
        process.exit(1);
    }
};

// Handle graceful shutdown
process.on("SIGINT", async () => {
    console.log("\n🛑 Shutting down gracefully...");
    await closeDB();
    process.exit(0);
});

process.on("SIGTERM", async () => {
    console.log("\n🛑 Shutting down gracefully...");
    await closeDB();
    process.exit(0);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
    console.error("❌ Uncaught Exception:", error);
    process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
    process.exit(1);
});

// Start the server
startServer();

module.exports = app;
