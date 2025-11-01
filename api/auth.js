// api/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// Correctly points to the Supabase client file
const supabase = require('../backend/supabaseClient'); 
const app = express();
app.use(express.json());

// --- User Registration with Supabase ---
// THIS IS THE FIX: The route is just '/register'
// Vercel routes '/api/auth/register' to this file
app.post('/register', async (req, res) => {
    const { id, name, email, password, role, roll_number, enrollment_number } = req.body;
    
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Uses Supabase's '.from().insert()' syntax
        const { data, error } = await supabase
            .from('users')
            .insert([{ 
                id, 
                name, 
                email, 
                password: hashedPassword, 
                role, 
                roll_number, 
                enrollment_number 
            }]);
        
        if (error) throw error; // Let the catch block handle Supabase errors
        
        res.status(201).json({ message: 'User registered successfully!' });

    } catch (error) {
        console.error('Supabase registration error:', error);
        // Supabase uses '23505' for unique constraint violations
        if (error.code === '23505') { 
            return res.status(409).json({ error: 'Email or ID already exists.' });
        }
        res.status(500).json({ error: 'Server error during registration.' });
    }
});

// --- Role-Specific Login Logic with Supabase ---
const handleLogin = async (req, res, expectedRole) => {
    const { email, password } = req.body;
    try {
        // Uses Supabase's '.from().select().single()' syntax
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single(); // Use .single() to get one record or an error

        // Check 1: Did Supabase return an error or find no user?
        if (error || !user) {
            return res.status(401).json({ error: 'Invalid credentials or user not found.' });
        }
        
        // Check 2: Does the user's role match the login portal?
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
        console.error(`Supabase login error for role ${expectedRole}:`, error);
        res.status(500).json({ error: 'Server error during login' });
    }
};

// --- Separate Login Routes for the Express App ---
// THIS IS THE FIX: The routes are now relative to the file
app.post('/teacher/login', (req, res) => handleLogin(req, res, 'teacher'));
app.post('/student/login', (req, res) => handleLogin(req, res, 'student'));

// Export the app for Vercel to use
module.exports = app;