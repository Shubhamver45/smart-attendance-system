// backend/routes/student.js
const express = require('express');
const pool = require('../db');
const haversine = require('haversine-distance');
const router = express.Router();

// --- Mark Attendance (with Geo-fencing) ---
// This is the route you provided, with your coordinates and distance.
router.post('/mark-attendance', async (req, res) => {
    const { lectureId, studentId, studentCoords } = req.body;
    
    // Coordinates for Loni Kalbhor, Maharashtra, India.
    const classroomCoords = { latitude: 18.494267, longitude: 74.019387 }; 
    const MAX_DISTANCE_METERS = 200; // 200-meter radius

    if (!studentCoords || !studentCoords.latitude || !studentCoords.longitude) {
        return res.status(400).json({ error: 'Student location is required.' });
    }

    // Calculate distance
    const distance = haversine(studentCoords, classroomCoords);

    if (distance > MAX_DISTANCE_METERS) {
        return res.status(403).json({ 
            error: 'Geo-fence failed. You are not in the classroom.',
            distance: distance.toFixed(0)
        });
    }

    try {
        // Check if attendance is already marked for this lecture
        const [existing] = await pool.query('SELECT * FROM attendance WHERE lecture_id = ? AND student_id = ?', [lectureId, studentId]);
        if(existing.length > 0) {
            return res.status(409).json({ message: 'Attendance already marked for this lecture.' });
        }

        // Insert the new attendance record
        await pool.query(
            'INSERT INTO attendance (lecture_id, student_id, status) VALUES (?, ?, ?)',
            [lectureId, studentId, 'present']
        );
        
        res.status(201).json({ message: 'Attendance marked successfully!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error while marking attendance.' });
    }
});

// --- GET All Lectures for a Student ---
// This route is necessary for students to see the lecture list.
router.get('/lectures', async (req, res) => {
    try {
        // We select lectures and also join the users table to get the teacher's name.
        const [lectures] = await pool.query(`
            SELECT lectures.*, users.name as teacher_name 
            FROM lectures 
            JOIN users ON lectures.teacher_id = users.id 
            WHERE users.role = 'teacher'
            ORDER BY lectures.created_at DESC
        `);
        res.json(lectures);
    } catch (error) {
        console.error("Error fetching lectures for student:", error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;