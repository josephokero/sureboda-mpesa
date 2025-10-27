require('dotenv').config();
const express = require('express');
const cors = require('cors');



const mpesaRoutes = require('./mpesa');
const mpesaCallbackRoutes = require('./mpesaCallback');

const app = express();


app.use(cors({
  origin: ['https://sureboda.com', 'https://www.sureboda.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));
app.use(express.json());

// M-Pesa API routes
app.use('/api/mpesa', mpesaRoutes);
app.use('/api/mpesa', mpesaCallbackRoutes);



// Basic route
app.get('/', (req, res) => {
  res.send('SureBoda API is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
