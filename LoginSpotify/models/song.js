module.exports = (sequelize, Sequelize) => {
    
    var modelDefinition = {
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
    return Songs = sequelize.define('song', modelDefinition, { charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' })
}
/*db.sync()
    .then(() => UserModel.create({
      playlistName: 'janedoe',
    }))
    .catch(function(error) {
        console.log(error);
    }); */