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

router.get('/', async (req, res) => {
    const { rows: players } = await db.query('SELECT * FROM players');
    res.send(players);
})

router.post('/', async (req, res) => {
    const { firstName, lastName, nickName} = req.body;
    const {rows: player} = await db.query('INSERT INTO players ("firstName", "lastName", "nickName") values ($1, $2, $3)', [firstName, lastName, nickName])
    res.send(player);
})

router.post('/:playerId', async (req, res) => {
    const player = await updateById(req.body, req.params.playerId, 'players');
    res.send(player)
})

router.get('/withGames', async (req, res) => {

    const { rows: players }  = await db.query('SELECT * FROM players');

    const playerResults = await Promise.all(players.map( async (player) => {
        const { rows: gameEntries } = await db.query('SELECT * FROM "gameEntry" WHERE player_id = $1', [player.id]);
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

    const { rows: players }  = await db.query('SELECT * FROM players');
    const { rows: factions }  = await db.query('SELECT * FROM factions');

    const playerResults = await Promise.all(players.map( async (player) => {
        const { rows: gameEntries } = await db.query('SELECT * FROM "gameEntry" WHERE player_id = $1', [player.id]);

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

        const playerWithFactions = { ...player, factionTotals, gamesPlayed, totalPoints };
        return playerWithFactions;
    }))

    res.send(playerResults);
})
