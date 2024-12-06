//Z
const express = require("express");
const multer = require("multer");
const XLSX = require("xlsx");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid"); // Generate unique IDs
const db = require("../db"); // Your database connection
const router = express.Router();

// Configure multer for handling file uploads
const upload = multer({ dest: "uploads/" });

router.post("/file-upload", upload.single("file"), (req, res) => {
//   if (!req.file) {
//     return res.status(400).send({ message: "No file uploaded" });
//   }

  try {
    const filePath = req.file.path; // Temporary location of the uploaded file
    const workbook = XLSX.readFile(filePath); // Read the Excel file
    const sheetName = workbook.SheetNames[0]; // Get the first sheet
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet); // Convert the sheet to JSON

    // Transform data for database insertion
    const vehicles = jsonData.map((row) => ({
      vehicleId: row.vehicleId?.toString() || uuidv4(), // Ensure unique ID
      name: row.name || "",
      dailyMileage: Number(row.dailyMileage || 0),
      remainingKm: Number(row.remainingKm || 0),
      alertType: row.alertType || "Unknown",
    }));

    // Check for duplicate vehicle IDs
    const seenIds = new Set();
    const filteredVehicles = vehicles.filter((v) => {
      if (seenIds.has(v.vehicleId)) return false; // Skip duplicates
      seenIds.add(v.vehicleId);
      return true;
    });

    // Insert filtered data into the database
    const query =
      "INSERT INTO vehicles (vehicleId, name, dailyMileage, remainingKm, alertType) VALUES ?";
    const values = filteredVehicles.map((v) => [
      v.vehicleId,
      v.name,
      v.dailyMileage,
      v.remainingKm,
      v.alertType,
    ]);

    if (values.length === 0) {
      return res.status(400).send({ message: "No valid data to insert" });
    }

    db.query(query, [values], (err) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).send({ message: "Database error", error: err });
      }

      // Respond with success
      res.status(200).send({ message: "File processed successfully", vehicles: filteredVehicles });
    });

    fs.unlinkSync(filePath); // Delete the temporary file
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).send({ message: "Error processing file", error });
  }
});

module.exports = router;
