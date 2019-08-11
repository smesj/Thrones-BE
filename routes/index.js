import players from './players'
import factions from './factions'
import games from './games'

module.exports = app => {
    app.use('/players', players)
    app.use('/factions', factions)
    app.use('/games', games)
}