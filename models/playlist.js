module.exports = (sequelize, Sequelize) => {
    let modelDefinition = {
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