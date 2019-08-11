import Router from 'express-promise-router'
import db from '../db'

const router = new Router();

module.exports = router

router.post('/', async (req, res) => {
    const { players } = req.body;
    const {rows: game} = await db.query('INSERT INTO games (date) values ($1) RETURNING *', [Date.now()]);
    const newEntries = Promise.all(players.map( async (player) => {
        const {rows: playerEntry} = await db.query('INSERT INTO "gameEntry" (game_id, player_id, faction_id, points, win) values ($1, $2, $3, $4, $5) RETURNING *', [game[0].id, player.id, player.factionId, player.points, player.win]);
        return playerEntry;
    }))
    

    res.send(newEntries);
})