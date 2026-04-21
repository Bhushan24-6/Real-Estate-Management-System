const express = require("express");
const router = express.Router();
const db = require("../db");

// 1. Properties by Agent
router.get("/agent-properties", (req, res) => {
    const sql = `
        SELECT a.agent_name, COUNT(p.property_id) as property_count 
        FROM agent a
        LEFT JOIN property p ON a.agent_id = p.agent_id 
        GROUP BY a.agent_id;
    `;
    db.query(sql, (err, result) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json(result);
    });
});

// 2. High Budget Buyers (> 1 Cr)
router.get("/high-budget-buyers", (req, res) => {
    const sql = "SELECT * FROM buyer WHERE budget > 10000000";
    db.query(sql, (err, result) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json(result);
    });
});

// 3. Total Payments by Booking
router.get("/total-payments", (req, res) => {
    const sql = `
        SELECT bk.booking_id, b.buyer_name, SUM(p.amount) as total_amount 
        FROM payment p
        JOIN booking bk ON p.booking_id = bk.booking_id
        JOIN buyer b ON bk.buyer_id = b.buyer_id
        GROUP BY bk.booking_id;
    `;
    db.query(sql, (err, result) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json(result);
    });
});

module.exports = router;
