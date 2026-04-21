const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all agents
router.get("/", (req, res) => {
    const sql = "SELECT * FROM agent";
    db.query(sql, (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(result);
        }
    });
});

// GET single agent
router.get("/:id", (req, res) => {
    const sql = "SELECT * FROM agent WHERE agent_id = ?";
    db.query(sql, [req.params.id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(result[0]);
        }
    });
});

// GET properties for a specific agent
router.get("/:id/properties", (req, res) => {
    const sql = "SELECT * FROM property WHERE agent_id = ?";
    db.query(sql, [req.params.id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(result);
        }
    });
});

// POST add a new agent
router.post("/", (req, res) => {
    const { Agent_Name, Contact_No, Commission_Rate } = req.body;

    if (!Agent_Name || !Contact_No) {
        return res.status(400).json({ error: "Name and Contact are required" });
    }

    const sql = "INSERT INTO agent (agent_name, contact_no, commission_rate) VALUES (?, ?, ?)";

    db.query(sql, [Agent_Name, Contact_No, Commission_Rate || 0], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: "Agent added successfully", id: result.insertId });
        }
    });
});

// UPDATE an agent
router.put("/:id", (req, res) => {
    const { Agent_Name, Contact_No, Commission_Rate } = req.body;
    const sql = `
        UPDATE agent 
        SET agent_name = ?, contact_no = ?, commission_rate = ?
        WHERE agent_id = ?
    `;
    db.query(sql, [Agent_Name, Contact_No, Commission_Rate, req.params.id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: "Agent updated successfully" });
        }
    });
});

// DELETE an agent
router.delete("/:id", (req, res) => {
    const sql = "DELETE FROM agent WHERE agent_id = ?";
    db.query(sql, [req.params.id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: "Agent deleted successfully" });
        }
    });
});

// POST assign property to agent
router.post("/assign", (req, res) => {
    const { Agent_ID, Property_ID } = req.body;
    const sql = "UPDATE property SET agent_id = ? WHERE property_id = ?";
    db.query(sql, [Agent_ID, Property_ID], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: "Property assigned to agent successfully" });
        }
    });
});

module.exports = router;
