const express = require('express');
const cors = require('cors');
const interventionsRouter = require('./routes/interventions');  // Correct import
const fileUploadRoutes = require('./routes/fileUpload');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/interventions', interventionsRouter);  // Correct usage of the router
app.use('/api', fileUploadRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
