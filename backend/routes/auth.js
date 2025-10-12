// backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const router = express.Router();

// --- User Registration (Updated for new student fields) ---
router.post('/register', async (req, res) => {
    // Now includes roll_number and enrollment_number from the form
    const { id, name, email, password, role, roll_number, enrollment_number } = req.body;
    
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // This query now includes the new fields, setting them to NULL if not provided (for teachers)
        await pool.query(
            'INSERT INTO users (id, name, email, password, role, roll_number, enrollment_number) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id, name, email, hashedPassword, role, roll_number || null, enrollment_number || null]
        );
        
        res.status(201).json({ message: 'User registered successfully!' });

    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Email or ID already exists.' });
        }
        res.status(500).json({ error: 'Server error during registration.' });
    }
});

// --- Role-Specific Login Logic (Helper Function) ---
// This central function handles the login process for any role.
const handleLogin = async (req, res, expectedRole) => {
    const { email, password } = req.body;
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];

        // Check 1: Does the user exist?
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials or user not found.' });
        }
        
        // Check 2: THIS IS THE SECURITY FIX. Does the user's role match the login portal?
        // (e.g., a student cannot log in via the /teacher/login route)
        if (user.role !== expectedRole) {
            return res.status(403).json({ error: `Access denied. Please use the '${user.role}' login portal.` });
        }

        // Check 3: Does the password match?
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        // If all checks pass, create the token
        const payload = { user: { id: user.id, role: user.role, name: user.name } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, user: payload.user });

    } catch (error) {
        console.error(`Login error for role ${expectedRole}:`, error);
        res.status(500).json({ error: 'Server error during login' });
    }
};

// --- NEW SEPARATE LOGIN ROUTES ---
// The old generic '/login' route is gone. We now have two specific routes.
// Your frontend must call the correct one based on the login page.
router.post('/teacher/login', (req, res) => handleLogin(req, res, 'teacher'));
router.post('/student/login', (req, res) => handleLogin(req, res, 'student'));

module.exports = router;