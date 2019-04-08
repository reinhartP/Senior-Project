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

    PlaylistSong.associate = function(models) {
        PlaylistSong.belongsTo(models.song, {
            foreignKey: 'song_id',
            targetKey: 'id',
        });
        PlaylistSong.belongsTo(models.playlist, {
            foreignKey: 'playlist_id',
            targetKey: 'id',
        });
    }
    
    return PlaylistSong;
}