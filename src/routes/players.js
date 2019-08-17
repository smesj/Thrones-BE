import Router from 'express-promise-router'
import db from '../db'

const router = new Router();

module.exports = router

const updateById = async (body, id, table) => {
    const updateString = Object.keys(body).map((key) => {
         return '"' + key.toString() + '"' + ' = ' + '"'+body[key]+'"';
    }).join(',');
    const { rows: result } = await db.query(`UPDATE ${table} SET ${updateString} WHERE ${table}.id = ${id} RETURNING *`);
    return result;
}

router.post('/checkNewUser', async (req, res) => {
    const { sub, nickname, email, picture } = req.body;
    const {rows: player} = await db.query('SELECT id FROM thrones.players WHERE thrones.players.id = $1', [sub]);

    if (!player.length) {
        const {rows: newPlayer} = await db.query('INSERT INTO thrones.players ("id", "email", "userName", "picture") values ($1, $2, $3, $4)', [sub, email, nickname, picture])
        res.send(newPlayer);
    } else {
        const newPlayer = []
        res.send("Existing player");
    }
})

router.get('/', async (req, res) => {
    const { rows: players } = await db.query('SELECT * FROM thrones.players');
    res.send(players);
})

// depreciated
router.post('/', async (req, res) => {
    const { firstName, lastName, nickName} = req.body;
    const {rows: player} = await db.query('INSERT INTO thrones.players ("firstName", "lastName", "nickName") values ($1, $2, $3)', [firstName, lastName, nickName])
    res.send(player);
})

router.post('/:playerId', async (req, res) => {
    const player = await updateById(req.body, req.params.playerId, 'thrones.players');
    res.send(player)
})

router.get('/withGames', async (req, res) => {

    const { rows: players }  = await db.query('SELECT * FROM thrones.players');

    const playerResults = await Promise.all(players.map( async (player) => {
        const { rows: gameEntries } = await db.query('SELECT * FROM thrones."gameEntry" WHERE player_id = $1', [player.id]);
        player.games = gameEntries;
        player.totalPoints = player.games.reduce((acc, curr) => {
            return acc + curr.points;
        }, 0);
        player.gamesPlayed = player.games.length;
        player.wins = player.games.filter(game => game.win === true).length;
        return player;
    }));

    res.send(playerResults);
})

router.get('/withFactions', async (req, res) => {

    const { rows: players }  = await db.query('SELECT * FROM thrones.players');
    const { rows: factions }  = await db.query('SELECT * FROM thrones.factions');

    const playerResults = await Promise.all(players.map( async (player) => {
        const { rows: gameEntries } = await db.query('SELECT * FROM thrones."gameEntry" WHERE player_id = $1', [player.id]);

        const factionTotals = factions.map((faction) => {
            const factionEntries = gameEntries.filter(game => game.faction_id === faction.id);
            var totalPoints = factionEntries.reduce((acc, curr) =>  acc + curr.points, 0);
            var gamesPlayed = factionEntries.length;
            var wins = factionEntries.filter(game => game.win === true).length;
            return { ...faction, totalPoints, gamesPlayed, wins };
        })
        var gamesPlayed = gameEntries.length;
        var totalPoints = gameEntries.reduce((acc, curr) => {
            return acc + curr.points;
        }, 0);
        var wins = gameEntries.filter(game => game.win === true).length;

        const playerWithFactions = { ...player, factionTotals, gamesPlayed, totalPoints, wins };
        return playerWithFactions;
    }))

    res.send(playerResults);
})
