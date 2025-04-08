const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
