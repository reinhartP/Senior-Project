var Sequelize = require('sequelize');

var config = require('./../config'),
    db = require('./../services/database');

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
const PlaylistModel = db.define('playlist', modelDefinition);

module.exports = PlaylistModel;



/*db.sync()
    .then(() => PlaylistModel.create(obj))
    .catch(function(error) {
        console.log(error);
    });*/