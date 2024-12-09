const express = require("express");
const db = require("../db");
const router = express.Router();

// Get all unresolved maintenance alerts
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

// Resolve a maintenance alert by updating its status
router.post("/resolve/:id", async (req, res) => {
    try {
      const { id } = req.params;
  
      // Fetch the specific alert
      const alertQuery = `
        SELECT ma.intervention_name,  v.name, v.dailyMileage, v.remainingKm AS vehicleRemainingKm
        FROM maintenance_alerts ma
        WHERE ma.id = ?`;
      const alert = await new Promise((resolve, reject) => {
        db.query(alertQuery, [id], (err, results) => {
          if (err) return reject(err);
          resolve(results[0]); // Expect one result
        });
      });
  
      if (!alert) {
        return res.status(404).send({ message: "Alert not found" });
      }
  
      // Calculate `next_due` based on the `remainingKm`
      const { intervention_name, remainingKm, name: vehicleName } = alert;
      const lastPerformed = new Date(); // Set to the current date
      const nextDue = remainingKm + (alert.vehicleRemainingKm || 0); // Next due mileage
  
      // Update the alert as resolved
      const resolveQuery = `
        UPDATE maintenance_alerts 
        SET alert_sent = TRUE, 
            last_performed = ?, 
            next_due = ? 
        WHERE id = ?`;
      await new Promise((resolve, reject) => {
        db.query(resolveQuery, [lastPerformed, nextDue, id], (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
  
      res.status(200).send({
        message: "Alert resolved successfully",
        data: {
          intervention_name,
          last_performed: lastPerformed,
          next_due: nextDue,
          vehicle_name: vehicleName,
        },
      });
    } catch (error) {
      console.error("Error resolving alert:", error);
      res.status(500).send({ message: "Error resolving alert", error });
    }
  });
  

// Get a list of all vehicles
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
