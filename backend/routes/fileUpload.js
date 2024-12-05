const express = require("express");
const multer = require("multer");
const XLSX = require("xlsx");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid"); // To generate unique IDs
const db = require("../db");
const router = express.Router();

// Configure multer for file upload
const upload = multer({ dest: "uploads/" });

router.post("/file-upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: "No file uploaded" });
  }

  try {
    // Read and parse the uploaded Excel file
    const filePath = req.file.path;
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    // Transform the data to ensure unique vehicleId values
    const vehicles = jsonData.map((row) => ({
      vehicleId: row.vehicleId?.toString() || uuidv4(), // Generate unique ID if missing
      name: row.name || "",
      dailyMileage: Number(row.dailyMileage || 0),
      remainingKm: Number(row.remainingKm || 0),
      alertType: row.alertType || "Unknown",
    }));

    // Validate and filter data for duplicates
    const seenIds = new Set();
    const filteredVehicles = vehicles.filter((v) => {
      if (!v.vehicleId || seenIds.has(v.vehicleId)) {
        console.warn(`Duplicate or empty vehicleId skipped: ${v.vehicleId}`);
        return false; // Skip duplicate or invalid IDs
      }
      seenIds.add(v.vehicleId);
      return true;
    });

    // Save data to the database
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

      // Respond with parsed and inserted data
      res
        .status(200)
        .send({ message: "File processed successfully", vehicles: filteredVehicles });
    });

    // Delete the uploaded file after processing
    fs.unlinkSync(filePath);
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).send({ message: "Error processing file", error });
  }
});

module.exports = router;
