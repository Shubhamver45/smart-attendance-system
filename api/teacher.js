// api/teacher.js
const express = require('express');
const pool = require('../backend/db'); // Correct path to the database connection
const app = express();
app.use(express.json());

// --- Create a new lecture and generate a QR code URL (UPDATED for PostgreSQL) ---
app.post('/api/teacher/lectures', async (req, res) => {
    const { name, subject, time, teacher_id } = req.body;
    try {
        // CORRECTED: Uses PostgreSQL's $1 syntax and RETURNING to get the new ID
        const query = 'INSERT INTO lectures (name, subject, time, teacher_id) VALUES ($1, $2, $3, $4) RETURNING id';
        const values = [name, subject, time, teacher_id];
        const result = await pool.query(query, values);
        const newLectureId = result.rows[0].id;

        const qrUrl = `${process.env.FRONTEND_URL}/attend?lectureId=${newLectureId}`;
        
        res.status(201).json({ 
            id: newLectureId, 
            qrUrl: qrUrl,
            name, subject, time, teacher_id
        });
    } catch (error) {
        console.error("Error creating lecture:", error);
        res.status(500).json({ error: 'Server error while creating lecture' });
    }
});

// --- Get all lectures for a specific teacher (UPDATED for PostgreSQL) ---
app.get('/api/teacher/lectures/:teacherId', async (req, res) => {
    try {
        // CORRECTED: Uses PostgreSQL's $1 syntax and result handling
        const result = await pool.query('SELECT * FROM lectures WHERE teacher_id = $1 ORDER BY created_at DESC', [req.params.teacherId]);
        
        const lecturesWithQrUrls = result.rows.map(lecture => ({
            ...lecture,
            qrUrl: `${process.env.FRONTEND_URL}/attend?lectureId=${lecture.id}`
        }));

        res.json(lecturesWithQrUrls);
    } catch (error) {
        console.error("Error fetching teacher lectures:", error);
        res.status(500).json({ error: 'Server error' });
    }
});

// --- Get Defaulter Report (< 75% attendance) (UPDATED for PostgreSQL) ---
app.get('/api/teacher/reports/defaulters/:teacherId', async (req, res) => {
    try {
        // CORRECTED: Uses PostgreSQL's $1 syntax and result handling
        const totalLecturesResult = await pool.query('SELECT COUNT(id) as total FROM lectures WHERE teacher_id = $1', [req.params.teacherId]);
        const totalLectures = totalLecturesResult.rows[0].total;

        if (totalLectures === 0) {
            return res.json([]);
        }

        // CORRECTED: Uses PostgreSQL's $1 syntax for the subquery
        const attendanceCountsResult = await pool.query(`
            SELECT u.id, u.name, COUNT(a.id) as attended_count
            FROM users u
            LEFT JOIN attendance a ON u.id = a.student_id
            WHERE u.role = 'student' AND a.lecture_id IN (SELECT id FROM lectures WHERE teacher_id = $1)
            GROUP BY u.id, u.name
        `, [req.params.teacherId]);

        const defaulters = attendanceCountsResult.rows.map(student => ({
            ...student,
            percentage: (student.attended_count / totalLectures) * 100
        })).filter(student => student.percentage < 75);

        if(defaulters.length > 0) {
            console.log("Simulating email to mentors for defaulters...");
            defaulters.forEach(defaulter => console.log(`- ${defaulter.name}`));
        }
        
        res.json(defaulters);
    } catch (error) {
        console.error("Error fetching defaulter report:", error);
        res.status(500).json({ error: 'Server error' });
    }
});

// --- GET live attendance records for an active lecture (UPDATED for PostgreSQL) ---
app.get('/api/teacher/lectures/:lectureId/attendance', async (req, res) => {
    try {
        const query = `
            SELECT a.id, a.timestamp, u.name as student_name 
             FROM attendance a
             JOIN users u ON a.student_id = u.id
             WHERE a.lecture_id = $1 
             ORDER BY a.timestamp ASC
        `;
        const result = await pool.query(query, [req.params.lectureId]);
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching live attendance:", error);
        res.status(500).json({ error: 'Server error' });
    }
});


// Export the app for Vercel to use as a serverless function
module.exports = app;