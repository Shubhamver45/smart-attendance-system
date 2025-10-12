require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// These will come from your Vercel environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL and Key are required.");
}

// Create a single, reusable Supabase client instance
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;