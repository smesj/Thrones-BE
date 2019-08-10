import players from './players'

module.exports = app => {
    app.use('/players', players)
}