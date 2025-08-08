const express = require('express');

const app = express();
const PORT = process.env.PORT || 8000;
require('dotenv').config();

// Middleware
app.use(express.json());

// Routes
const batchRoutes = require('./routes/batchRoutes');
app.use('/api/batch', batchRoutes);

// Start server
app.listen(PORT, () => console.log(`Server started at PORT: ${PORT}`));
