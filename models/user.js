const bcrypt = require("bcrypt-nodejs");

module.exports = (sequelize, Sequelize) => {
    let modelDefinition = {
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true
        },
        username: {
            type: Sequelize.STRING,
            unique: true
        },
        email: {
            type: Sequelize.STRING,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: Sequelize.STRING
        },
        spotify_access: {
            type: Sequelize.STRING
        },
        spotify_refresh: {
            type: Sequelize.STRING
        },
        google_id: {
            type: Sequelize.STRING
        },
        google_token: {
            type: Sequelize.STRING
        },
        google_email: {
            type: Sequelize.STRING
        },
        google_name: {
            type: Sequelize.STRING
        }
    };
    let User = sequelize.define("user", modelDefinition);

    User.associate = function(models) {
        User.hasMany(models.playlist, {
            foreignKey: "user_id",
            sourceKey: "id"
        });
    };

    return User;
};
