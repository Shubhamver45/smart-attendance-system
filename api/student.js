// api/student.js
const express = require('express');
const pool = require('../backend/db'); // Correct path to the database connection
const app = express();
app.use(express.json());

// --- Mark Attendance (UPDATED: Geo-fencing logic removed & uses PostgreSQL syntax) ---
app.post('/api/student/mark-attendance', async (req, res) => {
    // studentCoords is no longer needed or used
    const { lectureId, studentId } = req.body; 

    try {
        // CORRECTED: Uses PostgreSQL's $1, $2 syntax and result handling
        const existingCheck = await pool.query(
            'SELECT * FROM attendance WHERE lecture_id = $1 AND student_id = $2',
            [lectureId, studentId]
        );

        if (existingCheck.rows.length > 0) {
            return res.status(409).json({ message: 'Attendance already marked for this lecture.' });
        }

        // CORRECTED: Uses PostgreSQL's INSERT syntax and RETURNING to get the new ID
        const result = await pool.query(
            'INSERT INTO attendance (lecture_id, student_id, status) VALUES ($1, $2, $3) RETURNING id',
            [lectureId, studentId, 'present']
        );
        
        res.status(201).json({ 
            message: 'Attendance marked successfully!',
            newRecordId: result.rows[0].id 
        });

    } catch (error) {
        console.error("Error in /mark-attendance:", error);
        res.status(500).json({ error: 'Server error while marking attendance.' });
    }
});

// --- GET All Lectures for a Student (UPDATED for PostgreSQL) ---
app.get('/api/student/lectures', async (req, res) => {
    try {
        // The SQL query is compatible, but the result handling is now for PostgreSQL
        const query = `
            SELECT lectures.*, users.name as teacher_name 
            FROM lectures 
            JOIN users ON lectures.teacher_id = users.id 
            WHERE users.role = 'teacher'
            ORDER BY lectures.created_at DESC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching lectures for student:", error);
        res.status(500).json({ error: 'Server error' });
    }
});

// --- GET a specific student's attendance history (UPDATED for PostgreSQL) ---
app.get('/api/student/attendance/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        const result = await pool.query(
            'SELECT * FROM attendance WHERE student_id = $1 ORDER BY timestamp DESC',
            [studentId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching attendance history:", error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Export the app for Vercel to use as a serverless function
module.exports = app;