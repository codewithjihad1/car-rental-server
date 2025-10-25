/**
 * Cars Controller
 * Handles all car-related business logic
 */

const { ObjectId } = require("mongodb");

/**
 * Get all cars
 */
const getAllCars = async (req, res, carsCollection) => {
    try {
        const result = await carsCollection.find({}).toArray();
        res.send(result);
    } catch (error) {
        console.error("Error fetching all cars:", error);
        res.status(500).send({ error: "Failed to fetch cars" });
    }
};

/**
 * Get cars by user email
 */
const getCarsByUserEmail = async (req, res, carsCollection) => {
    try {
        const query = req.query;

        if (!query.userEmail) {
            return res
                .status(400)
                .send({ error: "Email query parameter is required" });
        }

        const result = await carsCollection
            .find(query)
            .sort({ dateAdded: -1 })
            .toArray();

        res.send(result);
    } catch (error) {
        console.error("Error fetching cars by user email:", error);
        res.status(500).send({ error: "Failed to fetch cars" });
    }
};

/**
 * Get recently added cars
 */
const getRecentCars = async (req, res, carsCollection) => {
    try {
        const result = await carsCollection
            .find({})
            .sort({ dateAdded: -1 })
            .limit(6)
            .toArray();

        res.send(result);
    } catch (error) {
        console.error("Error fetching recent cars:", error);
        res.status(500).send({ error: "Failed to fetch recent cars" });
    }
};

/**
 * Get available cars
 */
const getAvailableCars = async (req, res, carsCollection) => {
    try {
        const result = await carsCollection
            .find({ availability: "Available" })
            .toArray();

        res.send(result);
    } catch (error) {
        console.error("Error fetching available cars:", error);
        res.status(500).send({ error: "Failed to fetch available cars" });
    }
};

/**
 * Advanced car search with filters, sorting, and pagination
 */
const searchCars = async (req, res, carsCollection) => {
    try {
        const {
            query = "",
            minPrice,
            maxPrice,
            transmission,
            fuel,
            seats,
            rating,
            lat,
            lng,
            radius,
            sort = "dateAdded_desc",
            page = 1,
            limit = 12,
        } = req.query;

        // Build filter query
        const filter = {};

        // Text search (car model, brand, type)
        if (query) {
            filter.$or = [
                { carModel: { $regex: query, $options: "i" } },
                { model: { $regex: query, $options: "i" } },
                { brand: { $regex: query, $options: "i" } },
                { type: { $regex: query, $options: "i" } },
            ];
        }

        // Price range filter
        if (minPrice || maxPrice) {
            filter.$and = filter.$and || [];
            const priceFilter = {};
            if (minPrice) priceFilter.$gte = parseFloat(minPrice);
            if (maxPrice) priceFilter.$lte = parseFloat(maxPrice);
            filter.$and.push({
                $or: [
                    { dailyRentalPrice: priceFilter },
                    { price: priceFilter },
                ],
            });
        }

        // Transmission filter
        if (transmission) {
            filter.transmission = { $regex: transmission, $options: "i" };
        }

        // Fuel type filter
        if (fuel) {
            filter.$or = filter.$or || [];
            filter.$or.push(
                { fuelType: { $regex: fuel, $options: "i" } },
                { fuel: { $regex: fuel, $options: "i" } }
            );
        }

        // Seats filter
        if (seats) {
            filter.seats = { $gte: parseInt(seats) };
        }

        // Rating filter
        if (rating) {
            filter.rating = { $gte: parseFloat(rating) };
        }

        // Geolocation filter
        if (lat && lng && radius) {
            const radiusInKm = parseFloat(radius.replace("km", ""));
            const radiusInRadians = radiusInKm / 6371;

            filter["location.lat"] = {
                $gte: parseFloat(lat) - radiusInRadians * (180 / Math.PI),
                $lte: parseFloat(lat) + radiusInRadians * (180 / Math.PI),
            };
            filter["location.lng"] = {
                $gte:
                    parseFloat(lng) -
                    (radiusInRadians * (180 / Math.PI)) /
                        Math.cos((parseFloat(lat) * Math.PI) / 180),
                $lte:
                    parseFloat(lng) +
                    (radiusInRadians * (180 / Math.PI)) /
                        Math.cos((parseFloat(lat) * Math.PI) / 180),
            };
        }

        // Sorting
        const sortOptions = {
            dateAdded_desc: { dateAdded: -1 },
            dateAdded_asc: { dateAdded: 1 },
            price_asc: { dailyRentalPrice: 1, price: 1 },
            price_desc: { dailyRentalPrice: -1, price: -1 },
            rating_desc: { rating: -1 },
            model_asc: { carModel: 1, model: 1 },
            model_desc: { carModel: -1, model: -1 },
        };
        const sortQuery = sortOptions[sort] || { dateAdded: -1 };

        // Pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Execute query
        const totalCars = await carsCollection.countDocuments(filter);
        const cars = await carsCollection
            .find(filter)
            .sort(sortQuery)
            .skip(skip)
            .limit(limitNum)
            .toArray();

        res.send({
            cars,
            total: totalCars,
            totalPages: Math.ceil(totalCars / limitNum),
            currentPage: pageNum,
            limit: limitNum,
        });
    } catch (error) {
        console.error("Error in advanced search:", error);
        res.status(500).send({ error: "Internal server error" });
    }
};

/**
 * Get car by ID
 */
const getCarById = async (req, res, carsCollection) => {
    try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const car = await carsCollection.findOne(filter);

        if (!car) {
            return res.status(404).send({ error: "Car not found" });
        }

        res.send(car);
    } catch (error) {
        console.error("Error fetching car by ID:", error);
        res.status(500).send({ error: "Failed to fetch car" });
    }
};

/**
 * Create a new car
 */
const createCar = async (req, res, carsCollection) => {
    try {
        const car = req.body;
        const result = await carsCollection.insertOne(car);
        res.status(201).send(result);
    } catch (error) {
        console.error("Error creating car:", error);
        res.status(500).send({ error: "Failed to create car" });
    }
};

/**
 * Update a car
 */
const updateCar = async (req, res, carsCollection) => {
    try {
        const id = req.params.id;
        const carData = req.body;
        const filter = { _id: new ObjectId(id) };
        const updateDoc = { $set: carData };

        const result = await carsCollection.updateOne(filter, updateDoc);
        res.send(result);
    } catch (error) {
        console.error("Error updating car:", error);
        res.status(500).send({ error: "Failed to update car" });
    }
};

/**
 * Delete a car
 */
const deleteCar = async (req, res, carsCollection) => {
    try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const result = await carsCollection.deleteOne(filter);
        res.send(result);
    } catch (error) {
        console.error("Error deleting car:", error);
        res.status(500).send({ error: "Failed to delete car" });
    }
};

module.exports = {
    getAllCars,
    getCarsByUserEmail,
    getRecentCars,
    getAvailableCars,
    searchCars,
    getCarById,
    createCar,
    updateCar,
    deleteCar,
};
