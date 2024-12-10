const express = require("express");
const db = require("../db");

const router = express.Router();

// Get all alerts
router.get("/", async (req, res) => {
    try {
        const alerts = await db.query("SELECT * FROM alerts");
        res.json(alerts);
    } catch (error) {
        res.status(500).send("Error fetching alerts");
    }
});

module.exports = router;
