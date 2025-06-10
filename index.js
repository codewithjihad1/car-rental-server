const express = require("express");
const cors = require("cors");
const app = express();
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

async function run() {
    try {
        const db = client.db("car-rental");
        const carsCollection = db.collection("cars");

        // Get all cars
        app.get("/api/cars/all", async (req, res) => {
            const result = await carsCollection.find({}).toArray();
            res.send(result);
        });

        // Get Cars user email
        app.get("/api/cars", async (req, res) => {
            const query = req.query;
            if (!query.userEmail) {
                return res
                    .status(400)
                    .send({ error: "Email query parameter is required" });
            }
            const result = await carsCollection.find(query).toArray();
            res.send(result);
        });

        // post a new car
        app.post("/api/cars", async (req, res) => {
            const car = req.body;
            const result = await carsCollection.insertOne(car);
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
