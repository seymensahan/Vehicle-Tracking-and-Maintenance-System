const express = require('express');
const axios = require('axios');
const router = express.Router();

// Default route for /api/interventions
router.get('/', (req, res) => {
  res.json({ message: "Interventions API is working" });
});

// Route for /api/interventions/vehicles
router.get('/vehicles', async (req, res) => {
  try {
    const vehicles = await fetchVehicles();
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch vehicles", error });
  }
});

// Function to fetch vehicles data
const fetchVehicles = async () => {
  try {
    // Replace with the correct URL for your data source
    const response = await axios.get('http://localhost:5000/api/interventions');
    return response.data;
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    throw error; // Propagate error
  }
};

module.exports = router; // Export the router
