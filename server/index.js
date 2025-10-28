require('dotenv').config();
const express = require('express');
const cors = require('cors');



const mpesaRoutes = require('./mpesa');
const mpesaCallbackRoutes = require('./mpesaCallback');

const app = express();


const allowedOrigins = [
  'https://sureboda.com',
  'http://localhost:3000',
  'http://localhost:5000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));
// Explicitly handle preflight requests for all routes
app.options('*', cors());
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
