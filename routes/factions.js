import Router from 'express-promise-router'
import db from '../db'

const router = new Router();

module.exports = router

router.get('/', async (req, res) => {
    const { rows: factions } = await db.query('SELECT * FROM factions');
    res.send(factions);
})