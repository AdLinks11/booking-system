const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs'); 
const cors = require('cors');

const app = express();

// Enable CORS for requests from http://127.0.0.1:5500
app.use(cors({
    origin: 'http://127.0.0.1:5500',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '121102',
    database: 'docallos_Institute'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to database');
});

// Sign-Up Route
app.post('/signup', async (req, res) => {
    console.log('Signup request received:', req.body);
    const { email, password, confirm_password, termsCheck } = req.body;

    // Validation
    if (!email || !password || !confirm_password) {
        return res.setHeader('Content-Type', 'application/json').status(400).json({ error: 'All fields are required' });
    }
    if (password !== confirm_password) {
        return res.setHeader('Content-Type', 'application/json').status(400).json({ error: 'Passwords do not match' });
    }
    if (!termsCheck) {
        return res.setHeader('Content-Type', 'application/json').status(400).json({ error: 'You must agree to the terms' });
    }

    try {
        // Check if email exists
        db.query('SELECT email FROM users WHERE email = ?', [email], async (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.setHeader('Content-Type', 'application/json').status(500).json({ error: 'Server error' });
            }
            if (results.length > 0) {
                return res.setHeader('Content-Type', 'application/json').status(400).json({ error: 'Email already registered' });
            }

            // Hash password and create user
            const hashedPassword = await bcrypt.hash(password, 10);
            db.query(
                'INSERT INTO users (email, password) VALUES (?, ?)',
                [email, hashedPassword],
                (err) => {
                    if (err) {
                        console.error('Error creating user:', err);
                        return res.setHeader('Content-Type', 'application/json').status(500).json({ error: 'Error creating user' });
                    }
                    // Successful registration - redirect to login
                    return res.setHeader('Content-Type', 'application/json').status(200).json({ 
                        success: true, 
                        message: 'Registration successful!',
                        redirectUrl: '/traineeProgress/registration.html'
                    });
                }
            );
        });
    } catch (error) {
        console.error('Error in signup:', error);
        return res.setHeader('Content-Type', 'application/json').status(500).json({ error: 'Server error' });
    }
});

// Login Route
app.post('/login', async (req, res) => {
    console.log('Login request received:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
        return res.setHeader('Content-Type', 'application/json').status(400).json({ error: 'Email and password are required' });
    }

    try {
        db.query(
            'SELECT * FROM users WHERE email = ?',
            [email],
            async (err, results) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.setHeader('Content-Type', 'application/json').status(500).json({ error: 'Server error' });
                }
                if (results.length === 0) {
                    return res.setHeader('Content-Type', 'application/json').status(401).json({ error: 'Invalid email or password' });
                }

                const user = results[0];
                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    return res.setHeader('Content-Type', 'application/json').status(401).json({ error: 'Invalid email or password' });
                }
                
                return res.setHeader('Content-Type', 'application/json').status(200).json({ 
                    success: true,
                    message: 'Login successful!',
                    redirect: '/homePage/home.html'
                });
            }
        );
    } catch (error) {
        console.error('Error in login:', error);
        return res.setHeader('Content-Type', 'application/json').status(500).json({ error: 'Server error' });
    }
});

// Start the server
app.listen(3000, () => {
    console.log('Server running on port 3000');
});