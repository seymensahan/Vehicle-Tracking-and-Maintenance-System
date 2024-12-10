const express = require('express');
const cors = require('cors');
const path = require('path');
const interventionsRoutes = require('./routes/interventions');
const fileUploadRoutes = require('./routes/fileUpload');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/interventions', interventionsRoutes);
app.use('/api', fileUploadRoutes);

module.exports = app; // Export the app
