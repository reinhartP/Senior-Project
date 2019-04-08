module.exports = (sequelize, Sequelize) => {
    let modelDefinition = {
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

    let Artist = sequelize.define('artist', modelDefinition, {charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci'});
    Artist.associate = function(models) {
        Artist.hasMany(models.song, {
            foreignKey: 'artist_id',
            sourceKey: 'id',
        });
    }
    return Artist
};