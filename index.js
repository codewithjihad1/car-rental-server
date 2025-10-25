const express = require("express");
const cors = require("cors");
const app = express();
const admin = require("firebase-admin");

const serviceAccount = require("./firebase-adminsdk.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const { MongoClient, ObjectId } = require("mongodb");
const port = 3000;

// config dotenv
require("dotenv").config();

// Middleware
app.use(cors());
app.use(express.json());

// mongoDB connection string
const mongoURI = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@cluster0.ya0qxn8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// mongodb client
const client = new MongoClient(mongoURI);

// Verify Firebase ID Token Middleware
const verifyFirebaseToken = async (req, res, next) => {
    const idToken = req.headers.authorization?.split("Bearer ")[1];
    if (!idToken) {
        return res.status(401).send({ error: "Unauthorized" });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.decoded = decodedToken;
        next();
    } catch (error) {
        console.error("Error verifying Firebase ID token:", error);
        res.status(401).send({ error: "Unauthorized" });
    }
};

// verify user email middleware
const verifyTokenEmail = async (req, res, next) => {
    const email = req.query.userEmail;

    if (email !== req.decoded.email) {
        return res.status(403).send({ error: "Forbidden" });
    }

    next();
};

async function run() {
    try {
        const db = client.db("car-rental");
        const carsCollection = db.collection("cars");
        const bookingsCollection = db.collection("bookings");

        // Get all cars
        app.get("/api/cars/all", async (req, res) => {
            const result = await carsCollection.find({}).toArray();
            res.send(result);
        });

        // Get Cars user email
        app.get(
            "/api/cars",
            verifyFirebaseToken,
            verifyTokenEmail,
            async (req, res) => {
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
            }
        );

        // get recently added cars
        app.get("/api/cars/recently-added", async (req, res) => {
            const result = await carsCollection
                .find({})
                .sort({ dateAdded: -1 })
                .limit(6)
                .toArray();
            res.send(result);
        });

        // get available cars
        app.get("/api/cars/available", async (req, res) => {
            const result = await carsCollection
                .find({ availability: "Available" })
                .toArray();
            res.send(result);
        });

        // Advanced Car Search with filters, sorting, and pagination
        app.get("/api/cars/search", async (req, res) => {
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
                    filter.transmission = {
                        $regex: transmission,
                        $options: "i",
                    };
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

                // Geolocation filter (if lat, lng, radius provided)
                if (lat && lng && radius) {
                    const radiusInKm = parseFloat(radius.replace("km", ""));
                    const radiusInRadians = radiusInKm / 6371; // Earth radius in km

                    filter["location.lat"] = {
                        $gte:
                            parseFloat(lat) - radiusInRadians * (180 / Math.PI),
                        $lte:
                            parseFloat(lat) + radiusInRadians * (180 / Math.PI),
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
        });

        // get car by id
        app.get("/api/cars/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const car = await carsCollection.findOne(filter);
            if (!car) {
                return res.status(404).send({ error: "Car not found" });
            }
            res.send(car);
        });

        // get bookings by user email
        app.get(
            "/api/bookings",
            verifyFirebaseToken,
            verifyTokenEmail,
            async (req, res) => {
                const query = req.query;
                if (!query.userEmail) {
                    return res
                        .status(400)
                        .send({ error: "Email query parameter is required" });
                }
                const result = await bookingsCollection.find(query).toArray();
                res.send(result);
            }
        );

        // get booking count by car id
        app.get("/api/bookings/count/:carId", async (req, res) => {
            const carId = req.params.carId;
            const count = await bookingsCollection.countDocuments({ carId });
            res.send({ count });
        });

        // post a new car
        app.post("/api/cars", async (req, res) => {
            const car = req.body;
            const result = await carsCollection.insertOne(car);
            res.status(201).send(result);
        });

        // create a booking
        app.post("/api/bookings", async (req, res) => {
            const booking = req.body;
            const carId = booking.carId;
            const result = await bookingsCollection.insertOne(booking);
            if (!result.acknowledged) {
                return res
                    .status(500)
                    .send({ error: "Failed to create booking" });
            }

            const id = { _id: new ObjectId(carId) };
            await carsCollection.updateOne(id, {
                $inc: { bookingCount: 1 },
            });
            res.status(201).send(result);
        });

        // update a car
        app.put("/api/cars/:id", async (req, res) => {
            const id = req.params.id;
            const carData = req.body;
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: carData,
            };
            const result = await carsCollection.updateOne(filter, updateDoc);
            res.send(result);
        });

        // update booking
        app.patch("/api/bookings/:id", async (req, res) => {
            const id = req.params.id;
            const bookingData = req.body;
            const filter = { _id: new ObjectId(id) };
            const result = await bookingsCollection.updateOne(filter, {
                $set: bookingData,
            });
            res.send(result);
        });

        // delete a car
        app.delete("/api/cars/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const result = await carsCollection.deleteOne(filter);
            res.send(result);
        });

        // Start the server
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    } catch (error) {
        console.log(`Error connecting to MongoDB: ${error.message}`);
    }
}

run().catch((err) => {
    console.dir(err);
});
