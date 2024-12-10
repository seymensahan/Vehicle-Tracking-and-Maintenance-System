const express = require('express');
const cors = require('cors');
const path = require('path');
const interventionsRoutes = require('./routes/interventions');  // Correct import
const fileUploadRoutes = require('./routes/fileUpload');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/interventions', interventionsRoutes);  // Correct usage of the router
app.use('/api', fileUploadRoutes);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// Fallback to React's index.html for any other routes (so React Router works)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
