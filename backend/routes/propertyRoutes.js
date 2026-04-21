const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all properties (with optional filtering)
router.get("/", (req, res) => {
    const { type, minPrice, maxPrice, minArea, maxArea } = req.query;
    let sql = `
        SELECT p.*, o.owner_name, a.agent_name 
        FROM property p
        LEFT JOIN owner o ON p.owner_id = o.owner_id
        LEFT JOIN agent a ON p.agent_id = a.agent_id
        WHERE 1=1
    `;
    const params = [];

    if (type) {
        sql += " AND p.property_type = ?";
        params.push(type);
    }
    if (minPrice) {
        sql += " AND p.price >= ?";
        params.push(minPrice);
    }
    if (maxPrice) {
        sql += " AND p.price <= ?";
        params.push(maxPrice);
    }
    if (minArea) {
        sql += " AND p.area >= ?";
        params.push(minArea);
    }
    if (maxArea) {
        sql += " AND p.area <= ?";
        params.push(maxArea);
    }

    db.query(sql, params, (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(result);
        }
    });
});

// GET all owners (for dropdowns) - MUST be before /:id
router.get("/owners", (req, res) => {
    db.query("SELECT owner_id, owner_name FROM owner", (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(result);
        }
    });
});

// GET all agents (for dropdowns) - MUST be before /:id
router.get("/agents", (req, res) => {
    db.query("SELECT agent_id, agent_name FROM agent", (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(result);
        }
    });
});

// GET single property
router.get("/:id", (req, res) => {
    const sql = "SELECT * FROM property WHERE property_id = ?";
    db.query(sql, [req.params.id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(result[0]);
        }
    });
});

// POST add a new property
router.post("/", (req, res) => {
    const { Property_Type, Area, Price, Status, Owner_ID, Agent_ID, Address } = req.body;

    if (!Property_Type || !Area || !Price) {
        return res.status(400).json({ error: "Property_Type, Area, and Price are required" });
    }

    const sql = "INSERT INTO property(property_type, area, price, status, owner_id, agent_id, address) VALUES (?, ?, ?, ?, ?, ?, ?)";

    db.query(sql, [Property_Type, Area, Price, Status || "Available", Owner_ID || null, Agent_ID || null, Address || null], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: "Property added successfully", id: result.insertId });
        }
    });
});

// UPDATE a property
router.put("/:id", (req, res) => {
    const { Property_Type, Address, Area, Price, Status, Owner_ID, Agent_ID } = req.body;
    const sql = `
        UPDATE property 
        SET property_type = ?, address = ?, area = ?, price = ?, status = ?, owner_id = ?, agent_id = ?
        WHERE property_id = ?
    `;
    const params = [Property_Type, Address, Area, Price, Status, Owner_ID || null, Agent_ID || null, req.params.id];

    db.query(sql, params, (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: "Property updated successfully" });
        }
    });
});

// DELETE a property
router.delete("/:id", (req, res) => {
    const sql = "DELETE FROM property WHERE property_id = ?";
    db.query(sql, [req.params.id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: "Property deleted successfully" });
        }
    });
});

module.exports = router;