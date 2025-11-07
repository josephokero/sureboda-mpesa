const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const mpesaRoutes = require('../mpesa');
const mpesaCallbackRoutes = require('../mpesaCallback');

const app = express();
app.use(cors());
app.use(express.json());

// M-Pesa API routes
app.use('/api/mpesa', mpesaRoutes);
app.use('/api/mpesa', mpesaCallbackRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('SureBoda API is running (Vercel serverless)');
});

module.exports = serverless(app);
