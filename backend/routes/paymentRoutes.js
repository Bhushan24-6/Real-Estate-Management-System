const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all payments (with buyer and property info for context)
router.get("/", (req, res) => {
    const sql = `
        SELECT p.payment_no, p.amount, p.payment_date, p.payment_mode,
               b.buyer_name, prop.property_type
        FROM payment p
        JOIN booking bk ON p.booking_id = bk.booking_id
        JOIN buyer b ON bk.buyer_id = b.buyer_id
        JOIN property prop ON bk.property_id = prop.property_id
    `;
    db.query(sql, (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(result);
        }
    });
});

// POST a new payment
router.post("/", (req, res) => {
    const { Booking_ID, Amount, Payment_Date, Payment_Mode } = req.body;

    if (!Booking_ID || !Amount || !Payment_Date || !Payment_Mode) {
        return res.status(400).json({ error: "Booking_ID, Amount, Payment_Date, and Payment_Mode are required" });
    }

    const sql = "INSERT INTO payment(booking_id, amount, payment_date, payment_mode) VALUES (?, ?, ?, ?)";
    db.query(sql, [Booking_ID, Amount, Payment_Date, Payment_Mode], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: "Payment recorded successfully", id: result.insertId });
        }
    });
});

// DELETE a payment
router.delete("/:id", (req, res) => {
    const sql = "DELETE FROM payment WHERE payment_no = ?";
    db.query(sql, [req.params.id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: "Payment deleted successfully" });
        }
    });
});

module.exports = router;
