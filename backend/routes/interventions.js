const express = require("express");
const db = require("../db"); // Import the database connection
const router = express.Router();

// Default route for /api/interventions
router.get("/", (req, res) => {
  res.json({ message: "Interventions API is working" });
});

// Route for /api/interventions/vehicles
router.get("/vehicles", async (req, res) => {
  try {
    const query = "SELECT * FROM vehicles"; // Query to fetch all vehicles from the database

    // Execute the query
    const vehicles = await new Promise((resolve, reject) => {
      db.query(query, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    // Check if data exists
    if (vehicles.length > 0) {
      res.json(vehicles);
    } else {
      res.status(404).json({ message: "No vehicles found in the database" });
    }
  } catch (error) {
    console.error("Error fetching vehicles:", error.message);
    res.status(500).json({ message: "Failed to fetch vehicles", error: error.message });
  }
});

// Export the router
module.exports = router;
