const express = require("express");
const multer = require("multer");
const XLSX = require("xlsx");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const db = require("../db");

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" });

// Helper function to calculate remainingKm and determine alert type
const calculateRemainingKm = (currentKm, intervals) => {
  const intervalKeys = Object.keys(intervals);
  let remainingKm = Infinity;
  let alertType = "None";

  for (const key of intervalKeys) {
    const interval = intervals[key];
    if (currentKm < interval) {
      remainingKm = interval - currentKm;
      alertType = key;
      break;
    }
  }

  return { remainingKm, alertType };
};

// Maintenance intervals and corresponding alerts
const maintenanceIntervals = {
  "Contrôle générale des liaisons mécanique": 5000,
  "Contrôle générale des fonctions électrique": 10000,
  "Vérification des niveaux fluide": 20000,
  "Vidange moteur": 50000,
  "Remplacement des filtres à huile": 80000,
  "Remplacement des filtres à gasoil": 100000,
};

router.post("/file-upload", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    const vehicles = jsonData.map((row) => {
      const dailyMileage = Number(row["Le trajet (Km)"]) || 0;
      const currentKm = Number(row["Kilométrage final"]) || 0;
      const { remainingKm, alertType } = calculateRemainingKm(
        currentKm,
        maintenanceIntervals
      );

      return {
        vehicleId: uuidv4(),
        name: row["Tracker name"] || "",
        dailyMileage,
        remainingKm,
        alertType,
      };
    });

    // Process vehicles to update or insert into the database
    for (const vehicle of vehicles) {
      const { name, dailyMileage, remainingKm, alertType } = vehicle;

      // Check if vehicle exists
      const existingVehicleQuery = "SELECT * FROM vehicles WHERE name = ?";
      const existingVehicle = await new Promise((resolve, reject) => {
        db.query(existingVehicleQuery, [name], (err, results) => {
          if (err) return reject(err);
          resolve(results[0]); // Resolve with the first match
        });
      });

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
            [dailyMileage, updatedRemainingKm, alertType, name],
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
        const values = [[uuidv4(), name, dailyMileage, remainingKm, alertType]];
        await new Promise((resolve, reject) => {
          db.query(insertQuery, [values], (err) => {
            if (err) return reject(err);
            resolve();
          });
        });
      }
    }

    fs.unlinkSync(filePath); // Clean up temporary file
    res.status(200).send({ message: "File processed successfully" });
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).send({ message: "Error processing file", error });
  }
});

module.exports = router;
