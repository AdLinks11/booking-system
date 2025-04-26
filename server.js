require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
const port = 3000; // Define the port as a constant for easy modification

// Define allowed CORS origins from the .env file
// If CORS_ORIGIN is not set, fallback to the default origin
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://127.0.0.1:5500'];

// Configure CORS to allow requests from specified origins dynamically
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g., Postman) or if the origin is in the allowed list
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Create a database connection using environment variables
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to the database');
});

// Handle user signup
app.post('/signup', async (req, res) => {
    const { email, password, confirm_password, termsCheck } = req.body;

    if (!email || !password || !confirm_password) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    if (password !== confirm_password) {
        return res.status(400).json({ error: 'Passwords do not match' });
    }
    if (!termsCheck) {
        return res.status(400).json({ error: 'You must agree to the terms' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        db.query('SELECT email FROM users WHERE email = ?', [email], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            if (results.length > 0) {
                return res.status(400).json({ error: 'Email already exists' });
            }

            db.query(
                'INSERT INTO users (email, password) VALUES (?, ?)',
                [email, hashedPassword],
                (err) => {
                    if (err) {
                        console.error('Error inserting user:', err);
                        return res.status(500).json({ error: 'Error saving user' });
                    }
                    return res.status(200).json({
                        success: true,
                        message: 'Signup successful!',
                        redirectUrl: '/traineeProgress/registration.html'
                    });
                }
            );
        });
    } catch (error) {
        console.error('Error hashing password:', error);
        return res.status(500).json({ error: 'Server error' });
    }
});

// Handle user login
app.post('/login', async (req, res) => {
    // Log only non-sensitive data for security
    console.log('Login request received:', { email: req.body.email });
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        return res.status(200).json({
            success: true,
            message: 'Login successful!',
            redirect: '/homePage/home.html'
        });
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});