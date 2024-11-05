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

app.post('/api/signin', (req, res) => {
    let {email, password} = req.body;
    email = email.trim();
    password = password.trim();

    if (email == "" || password == "") {
        res.json({
            status: "FAILED",
            message: "Empty credentials supplied"
        })
    } else {
        user.find({email})
        .then(data => {
            if (data.length) {
                const hashedPassword = data[0].password;
                bcrypt.compare(password, hashedPassword).then(result => {
                    if (result) {
                        res.json({
                            status: "SUCCESS",
                            message: "Signin successful",
                            data: data
                        })
                    } else {
                        res.json({
                            status: "FAILED",
                            message: "Invalid password entered",
                            data: data
                        })
                    }
                })
                .catch(err => {
                    res.json({
                        status: "FAILED",
                        message: "An error occured while comparing passwords"
                    })
                })
            } else {
                res.json({
                    status: "FAILED",
                    message: "Invalid credentials entered"
                })
            }
        })
        .catch(err => {
            res.json({
                status: "FAILED",
                message: "An error occured while checking for existing user"
            })
        })
    }
})


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
