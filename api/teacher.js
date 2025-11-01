// api/teacher.js
const express = require('express');
const supabase = require('../backend/supabaseClient'); // Correct path to the Supabase client
const app = express();
app.use(express.json());

// --- Create a new lecture and generate a QR code URL (UPDATED for Supabase) ---
// THIS IS THE FIX: The route is now relative: '/lectures'
app.post('/lectures', async (req, res) => {
    const { name, subject, time, teacher_id } = req.body;
    try {
        const { data, error } = await supabase
            .from('lectures')
            .insert({ name, subject, time, teacher_id })
            .select('id')
            .single();

        if (error) throw error;
        const newLectureId = data.id;

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

// --- Get all lectures for a specific teacher (UPDATED for Supabase) ---
// THIS IS THE FIX: The route is now relative: '/lectures/:teacherId'
app.get('/lectures/:teacherId', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('lectures')
            .select('*')
            .eq('teacher_id', req.params.teacherId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        const lecturesWithQrUrls = data.map(lecture => ({
            ...lecture,
            qrUrl: `${process.env.FRONTEND_URL}/attend?lectureId=${lecture.id}`
        }));

        res.json(lecturesWithQrUrls);
    } catch (error) {
        console.error("Error fetching teacher lectures:", error);
        res.status(500).json({ error: 'Server error' });
    }
});

// --- Get Defaulter Report (< 75%) (UPDATED for Supabase RPC) ---
// THIS IS THE FIX: The route is now relative: '/reports/defaulters/:teacherId'
app.get('/reports/defaulters/:teacherId', async (req, res) => {
    try {
        // This calls the 'get_defaulters' function you created in the Supabase SQL Editor
        const { data, error } = await supabase.rpc('get_defaulters', {
            teacher_id_param: req.params.teacherId
        });

        if (error) throw error;

        // The data from the function is already filtered, so we can just send it
        if(data.length > 0) {
            console.log("Simulating email to mentors for defaulters...");
            data.forEach(defaulter => console.log(`- ${defaulter.name}`));
        }
        
        res.json(data);
    } catch (error) {
        console.error("Error fetching defaulter report:", error);
        res.status(500).json({ error: 'Server error' });
    }
});

// --- GET live attendance records for an active lecture (UPDATED for Supabase) ---
// THIS IS THE FIX: The route is now relative: '/lectures/:lectureId/attendance'
app.get('/lectures/:lectureId/attendance', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('attendance')
            .select(`
                id,
                timestamp,
                users ( name )
            `)
            .eq('lecture_id', req.params.lectureId)
            .order('timestamp', { ascending: true });

        if (error) throw error;
        
        // Flatten the nested student name from the 'users' table
        const records = data.map(record => ({
            id: record.id,
            timestamp: record.timestamp,
            student_name: record.users ? record.users.name : 'Unknown'
        }));

        res.json(records);
    } catch (error) {
        console.error("Error fetching live attendance:", error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Export the app for Vercel to use as a serverless function
module.exports = app;