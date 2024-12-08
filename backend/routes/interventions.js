//sunday
const express = require("express");
const db = require("../db");
const router = express.Router();

router.get("/alerts", async (req, res) => {
  try {
    const alertsQuery = `
      SELECT * FROM maintenance_alerts 
      WHERE alert_sent = FALSE`;
    const alerts = await new Promise((resolve, reject) => {
      db.query(alertsQuery, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
    res.status(200).send(alerts);
  } catch (error) {
    console.error("Error fetching alerts:", error);
    res.status(500).send({ message: "Error fetching alerts", error });
  }
});

router.post("/resolve/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const resolveQuery = `
      UPDATE maintenance_alerts 
      SET alert_sent = TRUE 
      WHERE alertId = ?`;
    await db.query(resolveQuery, [id]);
    res.status(200).send({ message: "Alert resolved successfully" });
  } catch (error) {
    console.error("Error resolving alert:", error);
    res.status(500).send({ message: "Error resolving alert", error });
  }
});
// Route for /api/interventions/vehicles
router.get("/vehicles", async (req, res) => {
    try {
      const query = "SELECT * FROM vehicles";
      db.query(query, (err, results) => {
        if (err) {
          console.error("Error fetching vehicles:", err.message);
          res.status(500).json({ message: "Failed to fetch vehicles", error: err.message });
        } else {
          res.json(results || []); // Return an empty array if no results
        }
      });
    } catch (error) {
      console.error("Error:", error.message);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });

module.exports = router;
