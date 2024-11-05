const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require('cors');

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
app.use(cors());

// Example GET endpoint
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello, World!' });
});

// Example POST endpoint
app.post('/api/echo', (req, res) => {
  const data = req.body;
  res.json({ received: data });
});

app.post('/api/signup', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(500).json({
                status: "FAILED",
                message: "Database connection not established, retry again later"
            });
        }
        
        let { name, email, password, dateOfBirth } = req.body;

        // Trim and validate input
        if (!name || !email || !password || !dateOfBirth) {
            return res.status(400).json({
                status: "FAILED",
                message: "Empty input fields"
            });
        }

        name = name.trim();
        email = email.trim();
        password = password.trim();
        dateOfBirth = dateOfBirth.trim();

        if (!/^[a-zA-Z ]+$/.test(name)) {
            return res.status(400).json({
                status: "FAILED",
                message: "Invalid name entered"
            });
        }

        if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
            return res.status(400).json({
                status: "FAILED",
                message: "Invalid email entered"
            });
        }

        if (isNaN(new Date(dateOfBirth).getTime())) {
            return res.status(400).json({
                status: "FAILED",
                message: "Invalid date of birth entered"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                status: "FAILED",
                message: "Password is too short"
            });
        }

        // Check for existing user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                status: "FAILED",
                message: "User with the provided email already exists"
            });
        }

        // Hash password and save user
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            dateOfBirth
        });

        const savedUser = await newUser.save();
        return res.status(201).json({
            status: "SUCCESS",
            message: "Signup successful",
            data: savedUser
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            status: "FAILED",
            message: "An error occurred during signup"
        });
    }
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
