/**
 * Advanced Car Search API Handler
 *
 * This is a comprehensive example showing how to implement
 * the advanced car search endpoint with various filtering options
 *
 * Framework: Express.js + MongoDB
 */

const express = require("express");
const { MongoClient } = require("mongodb");

// Example route handler
const advancedCarSearchHandler = async (req, res) => {
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

        // Build MongoDB filter query
        const filter = {};

        // 1. TEXT SEARCH - Search in multiple fields
        if (query) {
            filter.$or = [
                { carModel: { $regex: query, $options: "i" } },
                { model: { $regex: query, $options: "i" } },
                { brand: { $regex: query, $options: "i" } },
                { type: { $regex: query, $options: "i" } },
                { description: { $regex: query, $options: "i" } },
            ];
        }

        // 2. PRICE RANGE FILTER
        if (minPrice || maxPrice) {
            filter.$and = filter.$and || [];
            const priceFilter = {};

            if (minPrice) priceFilter.$gte = parseFloat(minPrice);
            if (maxPrice) priceFilter.$lte = parseFloat(maxPrice);

            // Support both field names (dailyRentalPrice and price)
            filter.$and.push({
                $or: [
                    { dailyRentalPrice: priceFilter },
                    { price: priceFilter },
                ],
            });
        }

        // 3. TRANSMISSION FILTER
        if (transmission) {
            filter.transmission = { $regex: transmission, $options: "i" };
        }

        // 4. FUEL TYPE FILTER
        if (fuel) {
            // Support both field names
            const fuelRegex = { $regex: fuel, $options: "i" };
            filter.$or = filter.$or || [];
            filter.$or.push({ fuelType: fuelRegex }, { fuel: fuelRegex });
        }

        // 5. SEATS FILTER (minimum seats required)
        if (seats) {
            filter.seats = { $gte: parseInt(seats) };
        }

        // 6. RATING FILTER (minimum rating)
        if (rating) {
            filter.rating = { $gte: parseFloat(rating) };
        }

        // 7. GEOLOCATION FILTER (nearby cars)
        // Uses bounding box approximation for performance
        // For production, consider using MongoDB $geoNear or $geoWithin
        if (lat && lng && radius) {
            const radiusInKm = parseFloat(radius.replace("km", ""));
            const radiusInRadians = radiusInKm / 6371; // Earth radius in km

            const latFloat = parseFloat(lat);
            const lngFloat = parseFloat(lng);

            // Calculate bounding box
            const latDelta = radiusInRadians * (180 / Math.PI);
            const lngDelta =
                (radiusInRadians * (180 / Math.PI)) /
                Math.cos((latFloat * Math.PI) / 180);

            filter["location.lat"] = {
                $gte: latFloat - latDelta,
                $lte: latFloat + latDelta,
            };
            filter["location.lng"] = {
                $gte: lngFloat - lngDelta,
                $lte: lngFloat + lngDelta,
            };
        }

        // 8. AVAILABILITY FILTER (optional - only show available)
        // Uncomment if you want to filter by availability by default
        // filter.availability = 'Available';

        // 9. SORTING
        const sortOptions = {
            dateAdded_desc: { dateAdded: -1 },
            dateAdded_asc: { dateAdded: 1 },
            price_asc: { dailyRentalPrice: 1, price: 1 },
            price_desc: { dailyRentalPrice: -1, price: -1 },
            rating_desc: { rating: -1 },
            rating_asc: { rating: 1 },
            model_asc: { carModel: 1, model: 1 },
            model_desc: { carModel: -1, model: -1 },
            bookings_desc: { bookingCount: -1 },
            bookings_asc: { bookingCount: 1 },
        };
        const sortQuery = sortOptions[sort] || { dateAdded: -1 };

        // 10. PAGINATION
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Validate pagination parameters
        if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
            return res.status(400).json({
                error: "Invalid pagination parameters",
            });
        }

        // 11. EXECUTE QUERIES
        // Get MongoDB collection
        const carsCollection = req.app.locals.db.collection("cars");

        // Count total documents matching filter
        const totalCars = await carsCollection.countDocuments(filter);

        // Fetch paginated results
        const cars = await carsCollection
            .find(filter)
            .sort(sortQuery)
            .skip(skip)
            .limit(limitNum)
            .toArray();

        // 12. SEND RESPONSE
        res.json({
            cars,
            total: totalCars,
            totalPages: Math.ceil(totalCars / limitNum),
            currentPage: pageNum,
            limit: limitNum,
            hasNextPage: pageNum < Math.ceil(totalCars / limitNum),
            hasPrevPage: pageNum > 1,
        });
    } catch (error) {
        console.error("Error in advanced search:", error);
        res.status(500).json({
            error: "Internal server error",
            message: error.message,
        });
    }
};

// ============================================
// OPTIMIZED VERSION WITH MONGODB AGGREGATION
// ============================================

const advancedCarSearchWithAggregation = async (req, res) => {
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

        const pipeline = [];

        // 1. Match stage - combine all filters
        const matchStage = {};

        if (query) {
            matchStage.$or = [
                { carModel: { $regex: query, $options: "i" } },
                { model: { $regex: query, $options: "i" } },
                { brand: { $regex: query, $options: "i" } },
                { type: { $regex: query, $options: "i" } },
            ];
        }

        if (minPrice || maxPrice) {
            const priceMatch = {};
            if (minPrice) priceMatch.$gte = parseFloat(minPrice);
            if (maxPrice) priceMatch.$lte = parseFloat(maxPrice);

            matchStage.$or = matchStage.$or || [];
            matchStage.$or.push(
                { dailyRentalPrice: priceMatch },
                { price: priceMatch }
            );
        }

        if (transmission) {
            matchStage.transmission = { $regex: transmission, $options: "i" };
        }

        if (fuel) {
            matchStage.$or = matchStage.$or || [];
            const fuelRegex = { $regex: fuel, $options: "i" };
            matchStage.$or.push({ fuelType: fuelRegex }, { fuel: fuelRegex });
        }

        if (seats) matchStage.seats = { $gte: parseInt(seats) };
        if (rating) matchStage.rating = { $gte: parseFloat(rating) };

        if (Object.keys(matchStage).length > 0) {
            pipeline.push({ $match: matchStage });
        }

        // 2. Geolocation filter (if provided)
        if (lat && lng && radius) {
            // Using $geoNear (requires 2dsphere index on location field)
            // Alternatively, use the bounding box approach from previous example
            pipeline.unshift({
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: [parseFloat(lng), parseFloat(lat)],
                    },
                    distanceField: "distance",
                    maxDistance: parseFloat(radius.replace("km", "")) * 1000, // Convert to meters
                    spherical: true,
                },
            });
        }

        // 3. Add computed fields (optional)
        pipeline.push({
            $addFields: {
                priceField: { $ifNull: ["$dailyRentalPrice", "$price"] },
            },
        });

        // 4. Facet for pagination and total count
        pipeline.push({
            $facet: {
                metadata: [{ $count: "total" }],
                cars: [
                    { $sort: getSortObject(sort) },
                    { $skip: (parseInt(page) - 1) * parseInt(limit) },
                    { $limit: parseInt(limit) },
                ],
            },
        });

        const carsCollection = req.app.locals.db.collection("cars");
        const [result] = await carsCollection.aggregate(pipeline).toArray();

        const totalCars = result.metadata[0]?.total || 0;
        const cars = result.cars || [];

        res.json({
            cars,
            total: totalCars,
            totalPages: Math.ceil(totalCars / parseInt(limit)),
            currentPage: parseInt(page),
            limit: parseInt(limit),
        });
    } catch (error) {
        console.error("Error in advanced search:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Helper function for sort
const getSortObject = (sort) => {
    const sortMap = {
        dateAdded_desc: { dateAdded: -1 },
        dateAdded_asc: { dateAdded: 1 },
        price_asc: { priceField: 1 },
        price_desc: { priceField: -1 },
        rating_desc: { rating: -1 },
        rating_asc: { rating: 1 },
    };
    return sortMap[sort] || { dateAdded: -1 };
};

// ============================================
// SETUP MONGODB INDEXES (Run once)
// ============================================

const setupIndexes = async (db) => {
    const carsCollection = db.collection("cars");

    try {
        // Text index for search
        await carsCollection.createIndex({
            carModel: "text",
            model: "text",
            brand: "text",
            type: "text",
            description: "text",
        });

        // Price indexes
        await carsCollection.createIndex({ dailyRentalPrice: 1 });
        await carsCollection.createIndex({ price: 1 });

        // Other filter indexes
        await carsCollection.createIndex({ transmission: 1 });
        await carsCollection.createIndex({ fuel: 1 });
        await carsCollection.createIndex({ fuelType: 1 });
        await carsCollection.createIndex({ seats: 1 });
        await carsCollection.createIndex({ rating: -1 });
        await carsCollection.createIndex({ availability: 1 });
        await carsCollection.createIndex({ dateAdded: -1 });

        // Geospatial index (for $geoNear queries)
        await carsCollection.createIndex({ location: "2dsphere" });

        // Compound indexes for common queries
        await carsCollection.createIndex({ availability: 1, dateAdded: -1 });
        await carsCollection.createIndex({ transmission: 1, fuel: 1 });

        console.log("All indexes created successfully");
    } catch (error) {
        console.error("Error creating indexes:", error);
    }
};

// ============================================
// EXPRESS ROUTE SETUP
// ============================================

const setupRoutes = (app) => {
    // Basic implementation
    app.get("/api/cars/search", advancedCarSearchHandler);

    // Or use the aggregation version
    // app.get('/api/cars/search', advancedCarSearchWithAggregation);
};

// Export handlers
module.exports = {
    advancedCarSearchHandler,
    advancedCarSearchWithAggregation,
    setupIndexes,
    setupRoutes,
};
