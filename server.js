const express = require('express');
const mysql = require('mysql2');
const { OAuth2Client } = require('google-auth-library');
const cors = require('cors');
const corsOptions = {
    origin: [
        'https://budget-website-project.onrender.com',
        'http://localhost:5500',
        'http://localhost:3001'
    ].filter(Boolean),
    methods: 'GET,POST',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
};
const app = express();
const client = new OAuth2Client('457823584077-c1td3bd3i5c6itoki7kcclc04id31bhp.apps.googleusercontent.com'); // Your Google Client ID
const PORT = 3001;

// MySQL Connection Setup 
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Your MySQL username
    password: '', // Your MySQL password
    database: 'myappdb', // Your database name
});

// Middleware to parse JSON
app.use(express.json());

// Endpoint to verify token and save user data
app.post('/verify-token', async (req, res) => {
    const token = req.body.token;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: '457823584077-c1td3bd3i5c6itoki7kcclc04id31bhp.apps.googleusercontent.com', // Your client ID
        });
        
        const payload = ticket.getPayload();
        const userEmail = payload.email;
        const userName = payload.name;

        // Check if the user already exists in the database
        db.query('SELECT * FROM users WHERE email = ?', [userEmail], (err, results) => {
            if (err) {
                console.error(err);
                res.status(500).json({ message: 'Error checking user' });
                return;
            }

            if (results.length > 0) {
                // User exists
                res.json({ message: 'User found', user: results[0] });
            } else {
                // Create a new user
                const query = 'INSERT INTO users (email, name) VALUES (?, ?)';
                db.query(query, [userEmail, userName], (err, results) => {
                    if (err) {
                        console.error(err);
                        res.status(500).json({ message: 'Error creating user' });
                        return;
                    }
                    res.json({ message: 'User created', user: { email: userEmail, name: userName } });
                });
            }
        });
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(500).json({ message: 'Error verifying token' });
    }
});

// Save table data (optional, based on your code)
app.post('/save-table', (req, res) => {
    // Implement saving table data into MySQL here
    res.json({ message: 'Data saved' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
