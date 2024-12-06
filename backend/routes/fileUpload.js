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

    // Process data and calculate `remainingKm`
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

    // Remove duplicate vehicles based on `vehicleId`
    const seenIds = new Set();
    const filteredVehicles = vehicles.filter((v) => {
      if (seenIds.has(v.vehicleId)) return false;
      seenIds.add(v.vehicleId);
      return true;
    });

    // Insert vehicles into the database
    const query =
      "INSERT INTO vehicles (vehicleId, name, dailyMileage, remainingKm, alertType) VALUES ?";
    const values = filteredVehicles.map((v) => [
      v.vehicleId,
      v.name,
      v.dailyMileage,
      v.remainingKm,
      v.alertType,
    ]);

    if (values.length > 0) {
      db.query(query, [values], (err) => {
        if (err) throw err;
      });
    }

    fs.unlinkSync(filePath); // Clean up temporary file

    res.status(200).send({ message: "File processed successfully", vehicles: filteredVehicles });
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).send({ message: "Error processing file", error });
  }
});

module.exports = router;  // This is important
