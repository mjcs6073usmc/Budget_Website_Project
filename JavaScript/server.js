const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const { OAuth2Client } = require('google-auth-library');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',               // MySQL username, usually 'root'
  password: 'cgs2545',        // Your MySQL password
  database: 'myappdb' // Replace with your actual database name
});

// Connect to MySQL
db.connect(err => {
  if (err) {
    console.error('MySQL connection error:', err);
  } else {
    console.log('Connected to MySQL!');
  }
});

// Initialize Google OAuth2 client with your Google Client ID
const client = new OAuth2Client('892068601820-49qtpohs2slgr4079rde8r0b32uoiii9.apps.googleusercontent.com');

// Route to save table data
app.post('/save-table', (req, res) => {
  const tableData = req.body.rows; // Expecting [{col1: val1, col2: val2, ...}, ...]

  const insertPromises = tableData.map(row => {
    return new Promise((resolve, reject) => {
      db.query('INSERT INTO your_table_name SET ?', row, (err, results) => { // Replace 'your_table_name' with your actual table name
        if (err) reject(err);
        else resolve(results);
      });
    });
  });

  Promise.all(insertPromises)
    .then(() => res.status(200).json({ message: 'Rows saved successfully!' }))
    .catch(error => res.status(500).json({ error: 'Error saving rows', details: error }));
});

// Handle Google Sign-In token verification
app.post('/verify-token', async (req, res) => {
  const { token } = req.body; // Get token from the frontend request

  try {
    // Verify the token using Google's library
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: '892068601820-49qtpohs2slgr4079rde8r0b32uoiii9.apps.googleusercontent.com', // Replace with your actual Google client ID
    });

    // Extract user info from the token (e.g., email, name)
    const payload = ticket.getPayload();
    const userId = payload.sub;
    const userEmail = payload.email;
    const userName = payload.name;

    // Now, you can save this user info to your database
    // For example, check if user already exists in the database
    const query = `SELECT * FROM users WHERE google_id = ?`;
    db.query(query, [userId], (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Error checking user' });
      }

      if (results.length > 0) {
        // User already exists, send back user info
        return res.status(200).json({ message: 'User found', data: results[0] });
      } else {
        // New user, insert into the database
        const insertQuery = `INSERT INTO users (google_id, email, name) VALUES (?, ?, ?)`;
        db.query(insertQuery, [userId, userEmail, userName], (err, result) => {
          if (err) {
            return res.status(500).json({ message: 'Error inserting user' });
          }
          return res.status(200).json({ message: 'User created', data: result });
        });
      }
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(400).json({ message: 'Invalid token' });
  }
});

// Server setup
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
