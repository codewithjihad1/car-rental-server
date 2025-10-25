/**
 * Bookings Controller
 * Handles all booking-related business logic
 */

const { ObjectId } = require("mongodb");
const pricingService = require("../services/pricingService");
const { isCouponValid } = require("../models/coupons");

/**
 * Get bookings by user email
 */
const getBookingsByUserEmail = async (req, res, bookingsCollection) => {
    try {
        const query = req.query;

        if (!query.userEmail) {
            return res
                .status(400)
                .send({ error: "Email query parameter is required" });
        }

        const result = await bookingsCollection.find(query).toArray();
        res.send(result);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).send({ error: "Failed to fetch bookings" });
    }
};

/**
 * Get booking count by car ID
 */
const getBookingCountByCarId = async (req, res, bookingsCollection) => {
    try {
        const carId = req.params.carId;
        const count = await bookingsCollection.countDocuments({ carId });
        res.send({ count });
    } catch (error) {
        console.error("Error fetching booking count:", error);
        res.status(500).send({ error: "Failed to fetch booking count" });
    }
};

/**
 * Create a new booking
 */
const createBooking = async (req, res, bookingsCollection, carsCollection) => {
    try {
        const booking = req.body;
        const carId = booking.carId;

        // Insert booking
        const result = await bookingsCollection.insertOne(booking);

        if (!result.acknowledged) {
            return res.status(500).send({ error: "Failed to create booking" });
        }

        // Update car booking count
        const id = { _id: new ObjectId(carId) };
        await carsCollection.updateOne(id, { $inc: { bookingCount: 1 } });

        res.status(201).send(result);
    } catch (error) {
        console.error("Error creating booking:", error);
        res.status(500).send({ error: "Failed to create booking" });
    }
};

/**
 * Update a booking
 */
const updateBooking = async (req, res, bookingsCollection) => {
    try {
        const id = req.params.id;
        const bookingData = req.body;
        const filter = { _id: new ObjectId(id) };

        const result = await bookingsCollection.updateOne(filter, {
            $set: bookingData,
        });

        res.send(result);
    } catch (error) {
        console.error("Error updating booking:", error);
        res.status(500).send({ error: "Failed to update booking" });
    }
};

/**
 * Get booking quote with dynamic pricing
 */
const getBookingQuote = async (
    req,
    res,
    carsCollection,
    bookingsCollection,
    couponsCollection
) => {
    try {
        const { carId, startDate, endDate, coupon } = req.body;

        // Validate required fields
        if (!carId || !startDate || !endDate) {
            return res.status(400).send({
                error: "carId, startDate, and endDate are required",
            });
        }

        // Validate dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        const now = new Date();

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).send({
                error: "Invalid date format",
            });
        }

        if (start < now) {
            return res.status(400).send({
                error: "Start date cannot be in the past",
            });
        }

        if (end <= start) {
            return res.status(400).send({
                error: "End date must be after start date",
            });
        }

        // Get car details
        const car = await carsCollection.findOne({ _id: new ObjectId(carId) });

        if (!car) {
            return res.status(404).send({ error: "Car not found" });
        }

        // Check availability
        const conflictingBookings = await bookingsCollection
            .find({
                carId: carId,
                status: { $in: ["confirmed", "pending"] },
                $or: [
                    {
                        startDate: { $lte: endDate },
                        endDate: { $gte: startDate },
                    },
                ],
            })
            .toArray();

        const unavailable = conflictingBookings.length > 0;

        // Get coupon if provided
        let couponData = null;
        let couponError = null;

        if (coupon) {
            couponData = await couponsCollection.findOne({
                code: coupon.toUpperCase(),
            });

            if (!couponData) {
                couponError = "Invalid coupon code";
            } else {
                const validation = isCouponValid(couponData);
                if (!validation.valid) {
                    couponError = validation.reason;
                    couponData = null;
                }
            }
        }

        // Get price rules for this car (if any custom rules exist)
        const carPriceRules = car.priceRules || undefined;

        // Generate quote
        const quote = pricingService.generateQuote(
            car,
            startDate,
            endDate,
            couponData,
            carPriceRules
        );

        // Return quote with availability info
        res.send({
            ...quote,
            unavailable,
            conflictingDates: unavailable
                ? conflictingBookings.map((b) => ({
                      startDate: b.startDate,
                      endDate: b.endDate,
                  }))
                : [],
            couponError: couponError || quote.appliedRules.coupon?.error,
        });
    } catch (error) {
        console.error("Error generating quote:", error);
        res.status(500).send({
            error: "Failed to generate quote",
            details: error.message,
        });
    }
};

/**
 * Get booked dates for a car (for calendar display)
 */
const getBookedDates = async (req, res, bookingsCollection) => {
    try {
        const { carId } = req.params;

        if (!carId) {
            return res.status(400).send({ error: "carId is required" });
        }

        // Get all confirmed/pending bookings for this car
        const bookings = await bookingsCollection
            .find({
                carId: carId,
                status: { $in: ["confirmed", "pending"] },
            })
            .toArray();

        // Extract date ranges
        const bookedRanges = bookings.map((booking) => ({
            startDate: booking.startDate,
            endDate: booking.endDate,
            status: booking.status,
        }));

        res.send({
            carId,
            bookedRanges,
            count: bookedRanges.length,
        });
    } catch (error) {
        console.error("Error fetching booked dates:", error);
        res.status(500).send({ error: "Failed to fetch booked dates" });
    }
};

module.exports = {
    getBookingsByUserEmail,
    getBookingCountByCarId,
    createBooking,
    updateBooking,
    getBookingQuote,
    getBookedDates,
};
