const express = require("express");
const db = require("../db");

const router = express.Router();

// Get all vehicles
router.get("/", async (req, res) => {
    try {
        const vehicles = await db.query("SELECT * FROM vehicles");
        res.json(vehicles);
    } catch (error) {
        res.status(500).send("Error fetching vehicles");
    }
});

module.exports = router;
