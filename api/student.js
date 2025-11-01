// api/student.js
const express = require('express');
// THIS IS THE FIX: We import the Supabase client, not the PostgreSQL pool
const supabase = require('../backend/supabaseClient'); 
const app = express();
app.use(express.json());

// --- Mark Attendance (UPDATED for Supabase) ---
// THIS IS THE FIX: The route is now relative: '/mark-attendance'
app.post('/mark-attendance', async (req, res) => {
    // Geo-fencing is removed, we only need lectureId and studentId
    const { lectureId, studentId } = req.body; 

    try {
        // CORRECTED: Uses Supabase's '.from().select()' to check for existing records
        const { data: existing, error: checkError } = await supabase
            .from('attendance')
            .select('id')
            .eq('lecture_id', lectureId)
            .eq('student_id', studentId);

        if (checkError) throw checkError;

        if (existing.length > 0) {
            return res.status(409).json({ message: 'Attendance already marked for this lecture.' });
        }

        // CORRECTED: Uses Supabase's '.from().insert()' to create a new record
        const { data, error } = await supabase
            .from('attendance')
            .insert({ lecture_id: lectureId, student_id: studentId, status: 'present' })
            .select('id') // Select the 'id' of the newly created row
            .single();   // We expect only one row to be created
        
        if (error) throw error;
        
        res.status(201).json({ 
            message: 'Attendance marked successfully!',
            newRecordId: data.id // Return the new ID
        });

    } catch (error) {
        console.error("Error in /mark-attendance:", error);
        res.status(500).json({ error: 'Server error while marking attendance.' });
    }
});

// --- GET All Lectures for a Student (UPDATED for Supabase) ---
// THIS IS THE FIX: The route is now relative: '/lectures'
app.get('/lectures', async (req, res) => {
    try {
        // CORRECTED: Uses Supabase's relational query syntax
        // This fetches all columns from 'lectures' and the 'name' from the related 'users' table
        const { data, error } = await supabase
            .from('lectures')
            .select(`
                *,
                users ( name )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Supabase returns the teacher's name in a nested object, so we flatten it
        const lectures = data.map(lecture => ({
            ...lecture,
            teacher_name: lecture.users ? lecture.users.name : 'Unknown Teacher'
        }));
        
        res.json(lectures);
    } catch (error) {
        console.error("Error fetching lectures for student:", error);
        res.status(500).json({ error: 'Server error' });
    }
});

// --- GET a specific student's attendance history (UPDATED for Supabase) ---
// THIS IS THE FIX: The route is now relative: '/attendance/:studentId'
app.get('/attendance/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        
        // CORRECTED: Uses Supabase's '.from().select()' with filtering and ordering
        const { data, error } = await supabase
            .from('attendance')
            .select('*')
            .eq('student_id', studentId)
            .order('timestamp', { ascending: false });

        if (error) throw error;
        
        res.json(data);
    } catch (error) {
        console.error("Error fetching attendance history:", error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Export the app for Vercel to use as a serverless function
module.exports = app;