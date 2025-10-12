// backend/db.js
require('dotenv').config();
const { Pool } = require('pg');

// This code is configured specifically for Vercel Postgres.
// It uses the POSTGRES_URL environment variable that Vercel automatically provides.
const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    // Vercel requires SSL for its database connections.
    ssl: {
        rejectUnauthorized: false
    }
});

console.log('Database connection pool created for Vercel PostgreSQL.');

module.exports = pool;