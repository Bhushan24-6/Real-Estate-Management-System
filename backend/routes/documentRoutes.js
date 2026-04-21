const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all documents for a specific agreement
router.get("/agreement/:id", (req, res) => {
    const sql = "SELECT * FROM document WHERE agreement_id = ?";
    db.query(sql, [req.params.id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(result);
        }
    });
});

// POST a new document
router.post("/", (req, res) => {
    const { Agreement_ID, Document_Type, Upload_Date } = req.body;

    if (!Agreement_ID || !Document_Type || !Upload_Date) {
        return res.status(400).json({ error: "Agreement_ID, Type, and Upload Date are required" });
    }

    const sql = "INSERT INTO document(agreement_id, document_type, upload_date) VALUES (?, ?, ?)";
    db.query(sql, [Agreement_ID, Document_Type, Upload_Date], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: "Document recorded successfully", id: result.insertId });
        }
    });
});

// DELETE a document
router.delete("/:id", (req, res) => {
    const sql = "DELETE FROM document WHERE document_no = ?";
    db.query(sql, [req.params.id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: "Document deleted successfully" });
        }
    });
});

module.exports = router;
