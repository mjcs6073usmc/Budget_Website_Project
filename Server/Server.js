const express = require('express');
const path = require('path');
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
require('dotenv').config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

const PORT = process.env.PORT || 3001;
// Serve static files (HTML, CSS, JS) from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse JSON bodies
app.use(express.json());

// Route to verify the ID token sent by the frontend
app.post('/verify-token', cors(corsOptions), async (req, res) => {
    console.log("Token verification request received");
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || 'https://budget-website-project.onrender.com');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        res.json({ success: true, user: payload });
    } catch (error) {
        console.error('Token verification failed:', error);
        res.status(400).json({ success: false, error: 'Invalid token' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Serve the index.html file when the root URL is accessed
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
