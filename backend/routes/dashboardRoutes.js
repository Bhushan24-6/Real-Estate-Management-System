const express = require("express");
const router = express.Router();
const db = require("../db");

// GET dashboard statistics
router.get("/stats", (req, res) => {
    const sql = `
        SELECT 
            (SELECT COUNT(*) FROM property) as total_properties,
            (SELECT COUNT(*) FROM buyer) as total_buyers,
            (SELECT COUNT(*) FROM agent) as total_agents,
            (SELECT COUNT(*) FROM booking) as total_bookings
    `;
    db.query(sql, (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(result[0]);
        }
    });
});

// GET latest listings
router.get("/latest", (req, res) => {
    const sql = `
        SELECT l.listing_no, l.listing_type, l.listing_date, p.property_type, p.address, p.price
        FROM listing l
        JOIN property p ON l.property_id = p.property_id
        ORDER BY l.listing_date DESC
        LIMIT 5
    `;
    db.query(sql, (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(result);
        }
    });
});

module.exports = router;
