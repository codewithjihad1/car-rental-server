/**
 * Cars Routes
 * Defines all routes related to cars
 */

const express = require("express");
const router = express.Router();
const carsController = require("../controllers/carsController");
const { verifyFirebaseToken, verifyTokenEmail } = require("../middleware/auth");

module.exports = (carsCollection) => {
    // Get all cars
    router.get("/all", (req, res) =>
        carsController.getAllCars(req, res, carsCollection)
    );

    // Get cars by user email (protected)
    router.get("/", verifyFirebaseToken, verifyTokenEmail, (req, res) =>
        carsController.getCarsByUserEmail(req, res, carsCollection)
    );

    // Get recently added cars
    router.get("/recently-added", (req, res) =>
        carsController.getRecentCars(req, res, carsCollection)
    );

    // Get available cars
    router.get("/available", (req, res) =>
        carsController.getAvailableCars(req, res, carsCollection)
    );

    // Advanced car search
    router.get("/search", (req, res) =>
        carsController.searchCars(req, res, carsCollection)
    );

    // Get car by ID
    router.get("/:id", (req, res) =>
        carsController.getCarById(req, res, carsCollection)
    );

    // Create a new car
    router.post("/", (req, res) =>
        carsController.createCar(req, res, carsCollection)
    );

    // Update a car
    router.put("/:id", (req, res) =>
        carsController.updateCar(req, res, carsCollection)
    );

    // Delete a car
    router.delete("/:id", (req, res) =>
        carsController.deleteCar(req, res, carsCollection)
    );

    return router;
};
