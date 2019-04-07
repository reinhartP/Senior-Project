module.exports = (sequelize, Sequelize) => {
    let modelDefinition = {
        youtube_id: {
            type: Sequelize.STRING
        },
    };
    return TopSong = sequelize.define('top_song', modelDefinition)
}