const express = require("express");
const db = require("../db");
const router = express.Router();

// Maintenance intervals for each intervention type
const maintenanceIntervals = {
  "Remplacement des filtres à gasoil": [5000, 10000, 20000, 50000, 100000],
  "Vidange moteur": [5000, 10000, 20000, 50000, 80000, 100000],
  "Contrôle du système de freinage": [5000, 10000, 20000, 50000, 100000],
  "Remplacement pneus": [100000],
  "Remplacement des batteries": [100000],
  "Réglage soupape": [10000, 20000, 50000, 80000],
  "Contrôle et serrage des boulons brides": [50000, 80000, 100000],
};

// Calculate the next maintenance due
const calculateNextDue = (interventionName, lastMileage) => {
  const intervals = maintenanceIntervals[interventionName] || [];
  for (const interval of intervals) {
    if (interval > lastMileage) {
      return interval;
    }
  }
  return null; // No future maintenance due
};

// Get all unresolved maintenance alerts
router.get("/alerts", async (req, res) => {
  try {
    const today = new Date();
    const alertsQuery = `
      SELECT * FROM maintenance_alerts 
      WHERE alert_sent = FALSE 
        OR last_performed < ?`;
    const alerts = await new Promise((resolve, reject) => {
      db.query(alertsQuery, [today], (err, results) => {
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
  const { id } = req.params;

  try {
    // Query the alert details from the `maintenance_alerts` table
    const alertQuery = `
      SELECT 
        intervention_name, 
        mileage, 
        vehicle_name 
      FROM maintenance_alerts
      WHERE id = ?`;

    const alert = await new Promise((resolve, reject) => {
      db.query(alertQuery, [id], (err, results) => {
        if (err) return reject(err);
        resolve(results[0]); // Expect only one result
      });
    });

    if (!alert) {
      return res.status(404).send({ message: "Alert not found" });
    }

    // Extract data from the alert
    const { intervention_name, mileage, vehicle_name } = alert;

    // Calculate the next due mileage
    const lastPerformed = new Date(); // Current date
    const nextDue = calculateNextDue(intervention_name, mileage);

    // Update the alert as resolved
    const resolveQuery = `
      UPDATE maintenance_alerts
      SET 
        alert_sent = TRUE, 
        last_performed = ?, 
        next_due = ?
      WHERE id = ?`;

    await new Promise((resolve, reject) => {
      db.query(resolveQuery, [lastPerformed, nextDue, id], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    // Respond with success
    res.status(200).send({
      message: "Alert resolved successfully",
      data: {
        intervention_name,
        last_performed: lastPerformed,
        next_due: nextDue,
        vehicle_name,
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
