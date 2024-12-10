//M
const express = require("express");
const multer = require("multer");
const XLSX = require("xlsx");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const db = require("../db");

const router = express.Router();

const upload = multer({ dest: "uploads/" });

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

// Helper function to calculate alerts for a vehicle
const calculateAlerts = (currentKm, dailyMileage) => {
  const alerts = [];

  for (const [maintenanceType, intervals] of Object.entries(
    maintenanceIntervals
  )) {
    for (const interval of intervals) {
      const remainingKm = interval - dailyMileage;
      if (remainingKm > 0 && currentKm < interval) {
        alerts.push({ maintenanceType, remainingKm });
      }
    }
  }

  // Sort alerts by urgency (smallest remainingKm)
  alerts.sort((a, b) => a.remainingKm - b.remainingKm);

  return alerts;
};

// File upload route
router.post("/file-upload", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    const notifications = [];

    for (const row of jsonData) {
      const name = row["Tracker name"] || "";
      const dailyMileage = Number(row["Le trajet (Km)"]) || 0;
      const currentKm = Number(row["Kilométrage final"]) || 0;

      // Calculate alerts for the vehicle
      const alertsForVehicle = calculateAlerts(currentKm, dailyMileage);

      if (alertsForVehicle.length > 0) {
        notifications.push({
          name,
          alerts: alertsForVehicle,
        });
      }

      // Determine the most urgent alert for the alertType field
      const mostUrgent = alertsForVehicle[0] || { maintenanceType: "None" };

      // Check if the vehicle exists in the database
      const existingVehicleQuery = "SELECT * FROM vehicles WHERE name = ?";
      const existingVehicle = await new Promise((resolve, reject) => {
        db.query(existingVehicleQuery, [name], (err, results) => {
          if (err) return reject(err);
          resolve(results[0]); // Resolve with the first match
        });
      });

      let vehicleName = name;

      if (existingVehicle) {
        // Update existing vehicle
        const updatedRemainingKm = Math.max(
          existingVehicle.remainingKm - dailyMileage,
          0
        );
        const updateQuery =
          "UPDATE vehicles SET dailyMileage = ?, remainingKm = ?, alertType = ? WHERE name = ?";
        await new Promise((resolve, reject) => {
          db.query(
            updateQuery,
            [dailyMileage, updatedRemainingKm, mostUrgent.maintenanceType, name],
            (err) => {
              if (err) return reject(err);
              resolve();
            }
          );
        });
      } else {
        // Insert new vehicle
        const insertQuery =
          "INSERT INTO vehicles (vehicleId, name, dailyMileage, remainingKm, alertType) VALUES ?";
        const values = [
          [
            uuidv4(),
            name,
            dailyMileage,
            alertsForVehicle[0]?.remainingKm || 0,
            mostUrgent.maintenanceType,
          ],
        ];

        await new Promise((resolve, reject) => {
          db.query(insertQuery, [values], (err) => {
            if (err) return reject(err);
            resolve();
          });
        });
      }

      // Insert maintenance alerts into the `maintenance_alerts` table
      for (const alert of alertsForVehicle) {
        const nextDue = alert.remainingKm; 

        const insertAlertQuery = `
          INSERT INTO maintenance_alerts (id, intervention_name, last_performed, next_due, mileage, vehicle_name, alert_sent)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            intervention_name = VALUES(intervention_name),
            last_performed = VALUES(last_performed),
            next_due = VALUES(next_due),
            mileage = VALUES(mileage),
            vehicle_name = VALUES(vehicle_name),
            alert_sent = VALUES(alert_sent)
        `;

        const alertId = uuidv4(); 
        const alertValues = [
          alertId,
          alert.maintenanceType,
          currentKm, 
          nextDue, 
          dailyMileage,
          vehicleName, 
          false, 
        ];

        await new Promise((resolve, reject) => {
          db.query(insertAlertQuery, alertValues, (err) => {
            if (err) return reject(err);
            resolve();
          });
        });
      }
    }

    fs.unlinkSync(filePath); 

    res.status(200).send({
      message: "File processed successfully",
      notifications,
    });
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).send({ message: "Error processing file", error });
  }
});

module.exports = router;
