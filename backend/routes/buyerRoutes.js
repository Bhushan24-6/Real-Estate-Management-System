const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all buyers
router.get("/", (req, res) => {
    const sql = "SELECT * FROM buyer";
    db.query(sql, (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(result);
        }
    });
});

// GET single buyer
router.get("/:id", (req, res) => {
    const sql = "SELECT * FROM buyer WHERE buyer_id = ?";
    db.query(sql, [req.params.id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(result[0]);
        }
    });
});

// POST register a new buyer
router.post("/", (req, res) => {
    const { Buyer_Name, Contact_No, DOB, Budget } = req.body;

    if (!Buyer_Name || !Budget) {
        return res.status(400).json({ error: "Buyer_Name and Budget are required" });
    }

    const sql = "INSERT INTO buyer(buyer_name, contact_no, dob, budget) VALUES (?, ?, ?, ?)";

    db.query(sql, [Buyer_Name, Contact_No, DOB, Budget], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: "Buyer registered successfully", id: result.insertId });
        }
    });
});

// UPDATE a buyer
router.put("/:id", (req, res) => {
    const { Buyer_Name, Contact_No, DOB, Budget } = req.body;
    const sql = `
        UPDATE buyer 
        SET buyer_name = ?, contact_no = ?, dob = ?, budget = ?
        WHERE buyer_id = ?
    `;
    db.query(sql, [Buyer_Name, Contact_No, DOB, Budget, req.params.id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: "Buyer updated successfully" });
        }
    });
});

// DELETE a buyer
router.delete("/:id", (req, res) => {
    const sql = "DELETE FROM buyer WHERE buyer_id = ?";
    db.query(sql, [req.params.id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: "Buyer deleted successfully" });
        }
    });
});

// GET visits for a specific buyer
router.get("/:id/visits", (req, res) => {
    const sql = `
        SELECT v.*, p.property_type, p.address 
        FROM visit v
        JOIN property p ON v.property_id = p.property_id
        WHERE v.buyer_id = ?
    `;
    db.query(sql, [req.params.id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(result);
        }
    });
});

// GET bookings for a specific buyer
router.get("/:id/bookings", (req, res) => {
    const sql = `
        SELECT bk.*, p.property_type, p.address, p.price
        FROM booking bk
        JOIN property p ON bk.property_id = p.property_id
        WHERE bk.buyer_id = ?
    `;
    db.query(sql, [req.params.id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(result);
        }
    });
});

module.exports = router;