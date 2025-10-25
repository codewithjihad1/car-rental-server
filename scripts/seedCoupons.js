/**
 * Sample data initialization script
 * Run this to add sample coupons to your database
 */

require("dotenv").config();
const { MongoClient } = require("mongodb");

const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@cluster0.ya0qxn8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const sampleCoupons = [
    {
        code: "WELCOME10",
        pct: 10,
        expiresAt: "2026-12-31T23:59:59Z",
        active: true,
        description: "Welcome discount - 10% off your first booking",
        usageLimit: 1000,
        usageCount: 0,
    },
    {
        code: "SUMMER20",
        pct: 20,
        expiresAt: "2025-08-31T23:59:59Z",
        active: true,
        description: "Summer special - 20% off",
        usageLimit: 500,
        usageCount: 0,
    },
    {
        code: "SAVE50",
        flat: 50,
        expiresAt: "2025-12-31T23:59:59Z",
        active: true,
        description: "Save $50 on your booking",
        usageLimit: 100,
        usageCount: 0,
    },
    {
        code: "LONGTERM",
        pct: 15,
        expiresAt: "2026-06-30T23:59:59Z",
        active: true,
        description: "Long-term rental discount",
        usageLimit: 200,
        usageCount: 0,
        minDays: 7,
    },
];

async function seedCoupons() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("✅ Connected to MongoDB");

        const db = client.db("CarRental");
        const couponsCollection = db.collection("coupons");

        // Clear existing coupons
        await couponsCollection.deleteMany({});
        console.log("🗑️  Cleared existing coupons");

        // Insert sample coupons
        const result = await couponsCollection.insertMany(sampleCoupons);
        console.log(`✅ Inserted ${result.insertedCount} coupons`);

        console.log("\n📋 Available Coupons:");
        sampleCoupons.forEach((coupon) => {
            const discount = coupon.pct ? `${coupon.pct}%` : `$${coupon.flat}`;
            console.log(
                `   ${coupon.code}: ${discount} - ${coupon.description}`
            );
        });
    } catch (error) {
        console.error("❌ Error seeding coupons:", error);
    } finally {
        await client.close();
        console.log("\n✅ Database connection closed");
    }
}

// Run if called directly
if (require.main === module) {
    seedCoupons().catch(console.error);
}

module.exports = { seedCoupons, sampleCoupons };
