module.exports = (sequelize, Sequelize) => {
    let modelDefinition = {
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey:  true,
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
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
<<<<<<< HEAD
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
=======
    return Playlist = sequelize.define('playlist', modelDefinition);
};
>>>>>>> de7282affed0eca2d7553d4e6e3616bbea5c79ff
