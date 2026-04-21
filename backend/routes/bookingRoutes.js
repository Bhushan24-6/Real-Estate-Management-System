const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all bookings (with buyer and property info)
router.get("/", (req, res) => {
    const sql = `
        SELECT bk.booking_id, bk.booking_date, bk.booking_status,
               b.buyer_name, p.property_type, p.price
        FROM booking bk
        LEFT JOIN buyer b ON bk.buyer_id = b.buyer_id
        LEFT JOIN property p ON bk.property_id = p.property_id
    `;
    db.query(sql, (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(result);
        }
    });
});

// GET single booking
router.get("/:id", (req, res) => {
    const sql = "SELECT * FROM booking WHERE booking_id = ?";
    db.query(sql, [req.params.id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(result[0]);
        }
    });
});

// POST create a new booking
router.post("/", (req, res) => {
    const { Booking_Date, Booking_Status, Buyer_ID, Property_ID } = req.body;

    if (!Buyer_ID || !Property_ID || !Booking_Date) {
        return res.status(400).json({ error: "Buyer_ID, Property_ID, and Booking_Date are required" });
    }

    const sql = "INSERT INTO booking(buyer_id, property_id, booking_date, booking_status) VALUES (?, ?, ?, ?)";

    db.query(sql, [Buyer_ID, Property_ID, Booking_Date, Booking_Status || "Pending"], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            // Mark property as booked
            db.query("UPDATE property SET status='Booked' WHERE property_id=?", [Property_ID]);
            res.json({ message: "Booking successful", id: result.insertId });
        }
    });
});

// UPDATE a booking
router.put("/:id", (req, res) => {
    const { Buyer_ID, Property_ID, Booking_Date, Booking_Status } = req.body;
    const sql = `
        UPDATE booking 
        SET buyer_id = ?, property_id = ?, booking_date = ?, booking_status = ?
        WHERE booking_id = ?
    `;
    db.query(sql, [Buyer_ID, Property_ID, Booking_Date, Booking_Status, req.params.id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: "Booking updated successfully" });
        }
    });
});

// DELETE a booking (Cancel)
router.delete("/:id", (req, res) => {
    // First, maybe fetch the property_id to set it back to "Available"?
    db.query("SELECT property_id FROM booking WHERE booking_id = ?", [req.params.id], (err, result) => {
        if (result && result.length > 0) {
            const propId = result[0].property_id;
            db.query("UPDATE property SET status='Available' WHERE property_id=?", [propId]);
        }
        
        const deleteSql = "DELETE FROM booking WHERE booking_id = ?";
        db.query(deleteSql, [req.params.id], (err, result) => {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json({ message: "Booking deleted successfully" });
            }
        });
    });
});

module.exports = router;