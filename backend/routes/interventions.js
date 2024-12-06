//z
const express = require("express");
const router = express.Router();
const db = require("../db");

// Endpoint to fetch overdue interventions.
router.get("/interventions", (req, res) => {
  const currentDate = new Date(); // Current date.
  db.query(
    "SELECT * FROM maintenance_alerts WHERE next_due <= ? AND alert_sent = FALSE",
    [currentDate], // Find alerts due by the current date.
    (err, results) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error fetching interventions", error: err.message });
      }
      res.status(200).json(results); // Return the list of alerts.
    }
  );
});

// Endpoint to mark an alert as sent.
router.put("/interventions/:id", (req, res) => {
  const { id } = req.params; // Get the alert ID from the URL.
  db.query(
    "UPDATE maintenance_alerts SET alert_sent = TRUE WHERE id = ?",
    [id], // Update the database.
    (err) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error updating intervention", error: err.message });
      }
      res.status(200).json({ message: "Intervention updated successfully" });
    }
  );
});

// Endpoint to resolve an alert.
router.post("/interventions/resolve/:vehicleId", (req, res) => {
  const { vehicleId } = req.params; // Get vehicle ID.
  db.query(
    "DELETE FROM maintenance_alerts WHERE vehicleId = ?", // Delete the alert.
    [vehicleId],
    (err) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error resolving alert", error: err.message });
      }
      res.status(200).json({ message: "Alert resolved successfully" });
    }
  );
});

module.exports = router;
