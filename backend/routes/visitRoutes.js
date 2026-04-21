const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all visits with property and buyer details
router.get("/", (req, res) => {
    const sql = `
        SELECT v.visit_no, v.visit_date, v.feedback, 
               p.property_type, p.address,
               b.buyer_name, b.contact_no
        FROM visit v
        JOIN property p ON v.property_id = p.property_id
        JOIN buyer b ON v.buyer_id = b.buyer_id
        ORDER BY v.visit_date DESC
    `;
    db.query(sql, (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(result);
        }
    });
});

// POST register a new visit
router.post("/", (req, res) => {
    const { Property_ID, Buyer_ID, Visit_Date, Feedback } = req.body;

    if (!Property_ID || !Buyer_ID || !Visit_Date) {
        return res.status(400).json({ error: "Property_ID, Buyer_ID, and Visit_Date are required" });
    }

    const sql = "INSERT INTO visit(property_id, buyer_id, visit_date, feedback) VALUES (?, ?, ?, ?)";

    db.query(sql, [Property_ID, Buyer_ID, Visit_Date, Feedback || ''], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: "Visit recorded successfully", id: result.insertId });
        }
    });
});

module.exports = router;
