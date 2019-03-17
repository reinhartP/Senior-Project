var Sequelize = require('sequelize');

var config = require('./../config'),
    db = require('./../services/database');


// Query a playlist_id to see what songs belong in that playlist
var modelDefinition = {
    playlist_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    song_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    position: {
        type: Sequelize.INTEGER,
        allowNull: true
    }
};
const PlaylistSongModel = db.define('playlist_song', modelDefinition);

module.exports = PlaylistSongModel;

/*db.sync()
    .then(() => UserModel.create({
      playlistName: 'janedoe',
    }))
    .catch(function(error) {
        console.log(error);
    }); */