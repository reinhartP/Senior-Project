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
    return Playlist = sequelize.define('playlist', modelDefinition, modelOptions);
};