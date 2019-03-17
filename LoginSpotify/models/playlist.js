module.exports = (sequelize, Sequelize) => {
    var modelDefinition = {
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        userId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        }
    };
    return Playlist = sequelize.define('playlist', modelDefinition);
};



/*db.sync()
    .then(() => PlaylistModel.create(obj))
    .catch(function(error) {
        console.log(error);
    });*/