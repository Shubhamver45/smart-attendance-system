// backend/db.js
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    // This connectionString will be provided automatically by Render
    connectionString: process.env.DATABASE_URL,
    // If you are using Render's free tier, SSL is required
    ssl: {
        rejectUnauthorized: false
    }
});

console.log('Database connection pool created for PostgreSQL.');
module.exports = pool;