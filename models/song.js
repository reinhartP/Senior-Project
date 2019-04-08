module.exports = (sequelize, Sequelize) => {
    let modelDefinition = {
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        artist_id: {
            type: Sequelize.STRING,
            allowNull: true
        },
        album_id: {
            type: Sequelize.STRING,
            allowNull: true
        },
        spotify: {
            type: Sequelize.STRING,
            unique: true,
            allowNull: true
        },
        apple: {
            type: Sequelize.STRING,
            allowNull: true
        },
        youtube: {
            type: Sequelize.STRING,
            allowNull: true
        }
    };
    let Song = sequelize.define('song', modelDefinition, { charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' })

    Song.associate = function(models) {
        Song.hasMany(models.playlist_song, {
            foreignKey: 'song_id',
            sourceKey: 'id'
        });
        Song.belongsTo(models.artist, {
            foreignKey: 'artist_id',
            targetKey: 'id',
        });
    }
    return Song
}