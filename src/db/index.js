require('dotenv').config()

const { Pool } = require('pg')
const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: 'localhost',
    database: 'postgres',
    password: process.env.POSTGRES_PASS,
    port: 5432,
})

module.exports = {
    query: (text, params) => pool.query(text, params),
}