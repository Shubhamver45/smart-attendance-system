// api/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// Correctly points to the db.js file outside the /api folder
const pool = require('../backend/db'); 

// Create an Express app for this serverless function
const app = express();
app.use(express.json());

// --- User Registration (Updated for PostgreSQL) ---
app.post('/api/auth/register', async (req, res) => {
    const { id, name, email, password, role, roll_number, enrollment_number } = req.body;
    
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // CORRECTED: Uses PostgreSQL's $1, $2, ... placeholder syntax
        const query = 'INSERT INTO users (id, name, email, password, role, roll_number, enrollment_number) VALUES ($1, $2, $3, $4, $5, $6, $7)';
        const values = [id, name, email, hashedPassword, role, roll_number || null, enrollment_number || null];
        
        await pool.query(query, values);
        
        res.status(201).json({ message: 'User registered successfully!' });

    } catch (error) {
        console.error(error);
        // CORRECTED: Uses PostgreSQL's unique violation error code
        if (error.code === '23505') { 
            return res.status(409).json({ error: 'Email or ID already exists.' });
        }
        res.status(500).json({ error: 'Server error during registration.' });
    }
});

// --- Role-Specific Login Logic (Updated for PostgreSQL) ---
const handleLogin = async (req, res, expectedRole) => {
    const { email, password } = req.body;
    try {
        // CORRECTED: Uses PostgreSQL's $1 placeholder and result handling
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials or user not found.' });
        }
        
        if (user.role !== expectedRole) {
            return res.status(403).json({ error: `Access denied. Please use the '${user.role}' login portal.` });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const payload = { user: { id: user.id, role: user.role, name: user.name } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, user: payload.user });

    } catch (error) {
        console.error(`Login error for role ${expectedRole}:`, error);
        res.status(500).json({ error: 'Server error during login' });
    }
};

// --- Separate Login Routes for the Express App ---
app.post('/api/auth/teacher/login', (req, res) => handleLogin(req, res, 'teacher'));
app.post('/api/auth/student/login', (req, res) => handleLogin(req, res, 'student'));

// Export the app for Vercel to use
module.exports = app;