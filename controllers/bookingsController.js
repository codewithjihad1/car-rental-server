/**
 * Bookings Controller
 * Handles all booking-related business logic
 */

const { ObjectId } = require("mongodb");

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

module.exports = {
    getBookingsByUserEmail,
    getBookingCountByCarId,
    createBooking,
    updateBooking,
};
