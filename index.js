const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const User = require('./models/user');

const bcrypt = require('bcrypt');
const user = require('./models/user');

// Middleware to parse JSON request bodies
app.use(express.json());

// Example GET endpoint
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello, World!' });
});

// Example POST endpoint
app.post('/api/echo', (req, res) => {
  const data = req.body;
  res.json({ received: data });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
