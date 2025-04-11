const express = require('express');
const path = require('path');
const { OAuth2Client } = require('google-auth-library');
const cors = require('cors');
const corsOptions = {
    origin: [
        'https://budget-website-project.onrender.com',
        'https://mjcs6073usmc.github.io',
        'http://localhost:5500',
        'http://localhost:3001'
    ].filter(Boolean),
    methods: 'GET,POST',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
};
const app = express();
require('dotenv').config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

const PORT = process.env.PORT || 3001;
// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '..')));

// Middleware to parse JSON bodies
app.use(express.json());

// Route to verify the ID token sent by the frontend
app.post('/verify-token', cors(corsOptions), async (req, res) => {
    console.log("Token verification request received");
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || 'https://mjcs6073usmc.github.io');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
    
    try {
        const { token } = req.body;
        if (!token) {
            console.log("No token provided");
            return res.status(400).json({ error: 'No token provided' });
        }

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        console.log("Token verified successfully");
        res.json({ success: true, user: payload });
    } catch (error) {
        console.error('Token verification failed:', error);
        res.status(400).json({ 
            success: false, 
            error: 'Invalid token',
            details: error.message 
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Serve the index.html file when the root URL is accessed
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Add this to your Server.js
app.get('/test', (req, res) => {
    res.json({ message: 'Server is working!' });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
