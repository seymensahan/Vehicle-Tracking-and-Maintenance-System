const express = require('express');
const axios = require('axios');
const router = express.Router();

// Define your routes here
router.get('/vehicles', async (req, res) => {
  try {
    const vehicles = await fetchVehicles();
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch vehicles", error });
  }
});

const fetchVehicles = async () => {
  try {
    const response = await axios.get('http://your-api-endpoint/vehicles');
    return response.data;
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    throw error;  // Propagate error
  }
};

module.exports = router;  // Export the router
