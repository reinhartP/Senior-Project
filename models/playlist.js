module.exports = (sequelize, Sequelize) => {
    let modelDefinition = {
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey:  true,
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        spotify_id: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        user_id: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        number_of_songs: {
            type: Sequelize.INTEGER,
        }
    };
    let modelOptions = {
        indexes: [
            {
                unique: true,
                fields: ['user_id', 'spotify_id']
            }
        ]
    };

    let Playlist = sequelize.define('playlist', modelDefinition, modelOptions);

    Playlist.associate = function(models) {
        Playlist.hasMany(models.playlist_song, {
            foreignKey: 'playlist_id',
            sourceKey: 'id',
        });
        Playlist.belongsTo(models.user, {
            foreignKey: 'user_id',
            targetKey: 'id',
        });
    }
    return Playlist
};