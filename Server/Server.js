const express = require('express');
const path = require('path');
const { OAuth2Client } = require('google-auth-library');
const app = express();
const client = new OAuth2Client('892068601820-49qtpohs2slgr4079rde8r0b32uoiii9.apps.googleusercontent.com'); // Replace with your Google Client ID

//enable cors to allow cross port access
const cors = require('cors');
const corsOptions = {
  origin: 'https://mjcs6073usmc.github.io', // GitHub Pages URL
  methods: 'GET,POST', // Allowed methods
  allowedHeaders: 'Content-Type, Authorization', // Allowed headers
  credentials: true, // Allow cookies (if necessary)
};

app.use(cors(corsOptions)); // Enable CORS globally for all routes





const PORT = process.env.PORT || 3000;
// Serve static files (HTML, CSS, JS) from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse JSON bodies
app.use(express.json());

// Route to verify the ID token sent by the frontend
app.post('/verify-token', async (req, res) => {
    console.log("made it to the token thing")
    res.setHeader('Access-Control-Allow-Origin', 'https://mjcs6073usmc.github.io'); // Debugging
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Debugging
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST'); // Debugging
    const { token } = req.body;
    try {
        // Verify the token using Google OAuth2Client
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: '892068601820-49qtpohs2slgr4079rde8r0b32uoiii9.apps.googleusercontent.com', // Your Google Client ID
        });

        const payload = ticket.getPayload(); // Get user info from the token
        res.json({ success: true, user: payload });
    } catch (error) {
        console.error('Token verification failed:', error);
        res.status(400).json({ success: false, error: 'Invalid token' });
    }
});

// Serve the index.html file when the root URL is accessed
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
