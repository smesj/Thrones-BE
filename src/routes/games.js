import Router from 'express-promise-router'
import db from '../db'

const router = new Router();

module.exports = router

router.post('/', async (req, res) => {
    const { players } = req.body;
    const {rows: game} = await db.query('INSERT INTO thrones.games (date) values ($1) RETURNING *', [Date.now()]);
    const newEntries = await Promise.all(players.map( async (player) => {
        const {rows: playerEntry} = await db.query('INSERT INTO thrones."gameEntry" (game_id, player_id, faction_id, points, win) values ($1, $2, $3, $4, $5) RETURNING *', [game[0].id, player.id, player.factionId, player.points, player.win]);
        return playerEntry;
    }))
    

    res.send(newEntries);
})

router.get('/', async (req, res) => {
    const {rows: games} = await db.query('SELECT * FROM thrones.games');

    const gamesResult = await Promise.all(games.map( async (game) => {
        const query = `
        select 
            ge.points,
            ge.win,
            p."firstName",
            p."lastName",
            p."userName",
            f."factionName",
            f."sigilLocation"
        from thrones."gameEntry" ge
        inner join thrones.players p on p.id = ge.player_id
        inner join thrones.factions f on f.id = ge.faction_id
        where game_id = $1;
        `
        const {rows: gameEntries} = await db.query(query, [game.id]);
        return {...game, gameEntries};
    }))
    

    res.send(gamesResult);
})