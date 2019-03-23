module.exports = (sequelize, Sequelize) => {
    let modelDefinition = {
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        spotifyId: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        userId: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        numberOfSongs: {
            type: Sequelize.INTEGER,
        }
    };
    let modelOptions = {
        indexes: [
            {
                unique: true,
                fields: ['userId', 'spotifyId']
            }
        ]
    };
    return Playlist = sequelize.define('playlist', modelDefinition, modelOptions);
};