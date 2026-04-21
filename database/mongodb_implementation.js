// ===============================================
// FA-2: MongoDB Implementation & Queries (CO5)
// Real Estate Management System
// ===============================================

// Switch to Real Estate Database
use('real_estate_db');

// ==============================================================
// SCHEMA DESIGN: Documents embedding relevant data
// ==============================================================

// Query 1: Create / InsertOne (Creating a property with embedded owner)
db.properties.insertOne({
    property_type: "Apartment",
    address: "101 Elite Heights, Pune",
    area: 1200,
    price: 7500000,
    status: "Available",
    owner: {
        name: "Rahul Sharma",
        contact_no: "9876543210",
        email: "rahul@gmail.com"
    }
});

// Query 2: InsertMany (Adding multiple entries)
db.properties.insertMany([
    {
        property_type: "Villa",
        address: "Greenwood Villas #5, Pune",
        area: 2500,
        price: 15000000,
        status: "Available",
        owner: {
            name: "Amit Patel",
            contact_no: "9123456789"
        }
    },
    {
        property_type: "Commercial",
        address: "Tech Park, Mumbai",
        area: 5000,
        price: 45000000,
        status: "Sold",
        owner: {
            name: "Sanjay Gupta",
            contact_no: "9000002222"
        }
    }
]);

// Query 3: Read / Find (Fetch all Available properties)
db.properties.find({ status: "Available" });


// Query 4: Find with Projection (Fetch only address and price)
db.properties.find(
    { price: { $gt: 10000000 } }, // Filter
    { address: 1, price: 1, _id: 0 } // Projection
);


// Query 5: UpdateOne (Update status of a specific property)
db.properties.updateOne(
    { address: "101 Elite Heights, Pune" },
    { $set: { status: "Sold" } }
);


// Query 6: UpdateMany (Give a 5% discount on all Available properties)
db.properties.updateMany(
    { status: "Available" },
    { $mul: { price: 0.95 } }
);


// Query 7: DeleteOne (Delete a specific property)
db.properties.deleteOne({ address: "Tech Park, Mumbai" });


// ==============================================================
// AGGREGATION PIPELINES
// ==============================================================

// Query 8: Aggregation (Calculate total value of properties grouped by status)
db.properties.aggregate([
    {
        $group: {
            _id: "$status",
            total_value: { $sum: "$price" },
            average_price: { $avg: "$price" },
            property_count: { $sum: 1 }
        }
    }
]);

// Query 9: Aggregation with Match (Calculate properties worth more than 1Cr)
db.properties.aggregate([
    { $match: { price: { $gt: 10000000 } } },
    {
        $group: {
            _id: "$property_type",
            count: { $sum: 1 }
        }
    }
]);


// ==============================================================
// INDEXING & SEARCH FEATURES
// ==============================================================

// Query 10: Create a Text Index on the address field
db.properties.createIndex({ address: "text", property_type: "text" });


// Query 11: Perform a Full-Text Search for the keyword "Villa"
db.properties.find({
    $text: { $search: "Villa" }
});


// Query 12: Creating an ascending index on Price for faster sorting
db.properties.createIndex({ price: 1 });


// Query 13: Find and Sort using the Index
db.properties.find({ status: "Available" }).sort({ price: -1 }); // -1 for descending checkout
