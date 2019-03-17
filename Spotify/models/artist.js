var Sequelize = require('sequelize');

var config = require('./../config'),
    db = require('./../services/database');

var modelDefinition = {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    spotify: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
    },
};
const ArtistModel = db.define('artist', modelDefinition, {charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci'});

module.exports = ArtistModel;

/*db.sync()
    .then(() => UserModel.create({
      playlistName: 'janedoe',
    }))
    .catch(function(error) {
        console.log(error);
    }); */