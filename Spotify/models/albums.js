var Sequelize = require('sequelize');

var config = require('./../config'),
    db = require('./../services/database');

var modelDefinition = {
    artist_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    }
};
const AlbumModel = db.define('album', modelDefinition);

module.exports = AlbumModel;

/*db.sync()
    .then(() => UserModel.create({
      playlistName: 'janedoe',
    }))
    .catch(function(error) {
        console.log(error);
    }); */