const express = require("express");
const cors = require("cors");
const app = express();
const admin = require("firebase-admin");

const serviceAccount = require("./firebase-adminsdk.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
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
}

// verify user email middleware
const verifyTokenEmail = async (req, res, next) => {
    const email = req.query.userEmail;

    if (email !== req.decoded.email) {
        return res.status(403).send({ error: "Forbidden" });        
    }

    next();
}

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
        app.get("/api/cars", verifyFirebaseToken, verifyTokenEmail, async (req, res) => {
            const query = req.query;
            if (!query.userEmail) {
                return res
                    .status(400)
                    .send({ error: "Email query parameter is required" });
            }
            const result = await carsCollection.find(query).sort({ dateAdded: -1 }).toArray();
            res.send(result);
        });

        // get recently added cars
        app.get("/api/cars/recently-added", async (req, res) => {
            const result = await carsCollection
                .find({})
                .sort({ dateAdded: -1 })
                .limit(8)
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
        app.get("/api/bookings", verifyFirebaseToken, verifyTokenEmail, async (req, res) => {
            const query = req.query;
            if (!query.userEmail) {
                return res
                    .status(400)
                    .send({ error: "Email query parameter is required" });
            }
            const result = await bookingsCollection.find(query).toArray();
            res.send(result);
        });

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
