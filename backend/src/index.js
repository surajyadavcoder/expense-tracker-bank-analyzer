const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const uploadRoute = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'Expense Tracker API running' });
});

app.use('/api', uploadRoute);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
