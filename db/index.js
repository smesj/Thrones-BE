// import Pool from 'pg';


const { Pool } = require('pg')
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'nap0le0n',
    port: 5432,
})

module.exports = {
    query: (text, params) => pool.query(text, params),
}