/**
 * Bookings Routes
 * Defines all routes related to bookings
 */

const express = require("express");
const router = express.Router();
const bookingsController = require("../controllers/bookingsController");
const { verifyFirebaseToken, verifyTokenEmail } = require("../middleware/auth");

module.exports = (bookingsCollection, carsCollection, couponsCollection) => {
    // Get bookings by user email (protected)
    router.get("/", verifyFirebaseToken, verifyTokenEmail, (req, res) =>
        bookingsController.getBookingsByUserEmail(req, res, bookingsCollection)
    );

    // Get booking count by car ID
    router.get("/count/:carId", (req, res) =>
        bookingsController.getBookingCountByCarId(req, res, bookingsCollection)
    );

    // Get booking quote with dynamic pricing
    router.post("/quote", (req, res) =>
        bookingsController.getBookingQuote(
            req,
            res,
            carsCollection,
            bookingsCollection,
            couponsCollection
        )
    );

    // Get booked dates for a car
    router.get("/booked-dates/:carId", (req, res) =>
        bookingsController.getBookedDates(req, res, bookingsCollection)
    );

    // Create a new booking
    router.post("/", (req, res) =>
        bookingsController.createBooking(
            req,
            res,
            bookingsCollection,
            carsCollection
        )
    );

    // Update a booking
    router.patch("/:id", (req, res) =>
        bookingsController.updateBooking(req, res, bookingsCollection)
    );

    return router;
};
