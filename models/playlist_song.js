module.exports = (sequelize, Sequelize) => {
    let modelDefinition = {
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
        },
        playlist_id: {
            type: Sequelize.UUID,
            allowNull: false,
        },
        song_id: {
            type: Sequelize.UUID,
            allowNull: false,
        },
    };

    let PlaylistSong = sequelize.define('playlist_song', modelDefinition);

    return PlaylistSong;
}