const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const User = require('./models/user');

const bcrypt = require('bcrypt');
const user = require('./models/user');

const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('Error connecting to MongoDB:', err);
});

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

app.post('/api/signin', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(500).json({
                status: "FAILED",
                message: "Database connection not established, retry again later"
            });
        }
      
        let { email, password } = req.body;

        // Basic validation
        if (!email || !password) {
            return res.status(400).json({
                status: "FAILED",
                message: "Empty credentials supplied"
            });
        }

        email = email.trim();
        password = password.trim();

        // Find user by email
        const data = await user.find({ email });
        if (!data.length) {
            return res.status(401).json({
                status: "FAILED",
                message: "Invalid credentials entered"
            });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, data[0].password);
        if (isMatch) {
            return res.status(200).json({
                status: "SUCCESS",
                message: "Signin successful",
                data: data
            });
        } else {
            return res.status(401).json({
                status: "FAILED",
                message: "Invalid password entered"
            });
        }
    } catch (err) {
        console.error(err); // Log the error for debugging
        return res.status(500).json({
            status: "FAILED",
            message: "An error occurred during the signin process"
        });
    }
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
