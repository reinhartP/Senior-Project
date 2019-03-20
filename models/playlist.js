module.exports = (sequelize, Sequelize) => {
    let modelDefinition = {
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        userId: {
            type: Sequelize.STRING,
            allowNull: false,
        }
    };
    return Playlist = sequelize.define('playlist', modelDefinition);
};