const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all agreements (with property info)
router.get("/", (req, res) => {
    const sql = `
        SELECT a.*, p.property_type, p.address
        FROM agreement a
        JOIN property p ON a.property_id = p.property_id
    `;
    db.query(sql, (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(result);
        }
    });
});

// POST a new agreement
router.post("/", (req, res) => {
    const { Property_ID, Agreement_Type, Start_Date, End_Date } = req.body;

    if (!Property_ID || !Agreement_Type || !Start_Date || !End_Date) {
        return res.status(400).json({ error: "Property_ID, Type, Start and End dates are required" });
    }

    const sql = "INSERT INTO agreement(property_id, agreement_type, start_date, end_date) VALUES (?, ?, ?, ?)";
    db.query(sql, [Property_ID, Agreement_Type, Start_Date, End_Date], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: "Agreement created successfully", id: result.insertId });
        }
    });
});

// DELETE an agreement
router.delete("/:id", (req, res) => {
    const sql = "DELETE FROM agreement WHERE agreement_id = ?";
    db.query(sql, [req.params.id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: "Agreement deleted successfully" });
        }
    });
});

module.exports = router;
