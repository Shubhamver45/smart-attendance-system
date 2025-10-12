// backend/routes/teacher.js
const express = require('express');
const pool = require('../db');
const router = express.Router();

// --- Create a new lecture and generate a QR code URL ---
router.post('/lectures', async (req, res) => {
    const { name, subject, time, teacher_id } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO lectures (name, subject, time, teacher_id) VALUES (?, ?, ?, ?)',
            [name, subject, time, teacher_id]
        );
        const newLectureId = result.insertId;

        // Create the full URL for the QR code using the frontend address from your .env file
        const qrUrl = `${process.env.FRONTEND_URL}/attend?lectureId=${newLectureId}`;
        
        // Return the new lecture data PLUS the URL for the QR code
        res.status(201).json({ 
            id: newLectureId, 
            qrUrl: qrUrl, // This is sent to the frontend
            name,
            subject,
            time,
            teacher_id
        });

    } catch (error) {
        console.error("Error creating lecture:", error);
        res.status(500).json({ error: 'Server error while creating lecture' });
    }
});

// --- Get all lectures for a specific teacher (UPDATED) ---
router.get('/lectures/:teacherId', async (req, res) => {
    try {
        const [lectures] = await pool.query('SELECT * FROM lectures WHERE teacher_id = ? ORDER BY created_at DESC', [req.params.teacherId]);
        
        // THIS IS THE FIX: Add the full qrUrl to each lecture object
        const lecturesWithQrUrls = lectures.map(lecture => ({
            ...lecture,
            qrUrl: `${process.env.FRONTEND_URL}/attend?lectureId=${lecture.id}`
        }));

        res.json(lecturesWithQrUrls);
    } catch (error) {
        console.error("Error fetching teacher lectures:", error);
        res.status(500).json({ error: 'Server error' });
    }
});

// --- Get Defaulter Report (< 75% attendance) ---
router.get('/reports/defaulters/:teacherId', async (req, res) => {
    try {
        const [totalLecturesResult] = await pool.query('SELECT COUNT(id) as total FROM lectures WHERE teacher_id = ?', [req.params.teacherId]);
        const totalLectures = totalLecturesResult[0].total;

        if (totalLectures === 0) {
            return res.json([]); // No lectures, so no defaulters
        }

        const [attendanceCounts] = await pool.query(`
            SELECT u.id, u.name, COUNT(a.id) as attended_count
            FROM users u
            LEFT JOIN attendance a ON u.id = a.student_id
            WHERE u.role = 'student' AND a.lecture_id IN (SELECT id FROM lectures WHERE teacher_id = ?)
            GROUP BY u.id, u.name
        `, [req.params.teacherId]);

        const defaulters = attendanceCounts.map(student => ({
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

module.exports = router;