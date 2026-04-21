const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all owners
router.get("/", (req, res) => {
    const sql = "SELECT * FROM owner";
    db.query(sql, (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(result);
        }
    });
});

// GET single owner
router.get("/:id", (req, res) => {
    const sql = "SELECT * FROM owner WHERE owner_id = ?";
    db.query(sql, [req.params.id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(result[0]);
        }
    });
});

// GET properties for a specific owner
router.get("/:id/properties", (req, res) => {
    const sql = "SELECT * FROM property WHERE owner_id = ?";
    db.query(sql, [req.params.id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(result);
        }
    });
});

// POST add a new owner
router.post("/", (req, res) => {
    const { Owner_Name, Email, Contact_No, Street, City, Pincode } = req.body;

    if (!Owner_Name || !Email || !Contact_No) {
        return res.status(400).json({ error: "Name, Email, and Contact are required" });
    }

    const sql = "INSERT INTO owner (owner_name, email, contact_no, street, city, pincode) VALUES (?, ?, ?, ?, ?, ?)";

    db.query(sql, [Owner_Name, Email, Contact_No, Street || null, City || null, Pincode || null], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: "Owner added successfully", id: result.insertId });
        }
    });
});

// UPDATE an owner
router.put("/:id", (req, res) => {
    const { Owner_Name, Email, Contact_No, Street, City, Pincode } = req.body;
    const sql = `
        UPDATE owner 
        SET owner_name = ?, email = ?, contact_no = ?, street = ?, city = ?, pincode = ?
        WHERE owner_id = ?
    `;
    db.query(sql, [Owner_Name, Email, Contact_No, Street, City, Pincode, req.params.id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: "Owner updated successfully" });
        }
    });
});

// DELETE an owner
router.delete("/:id", (req, res) => {
    const sql = "DELETE FROM owner WHERE owner_id = ?";
    db.query(sql, [req.params.id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: "Owner deleted successfully" });
        }
    });
});

module.exports = router;
