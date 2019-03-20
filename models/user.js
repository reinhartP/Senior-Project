const bcrypt = require('bcrypt-nodejs');

module.exports = (sequelize, Sequelize) => {
    let modelDefinition = {
        id: {
            autoIncrement: true,
            primaryKey:  true,
            type: Sequelize.INTEGER,
        },
        email: {
            type: Sequelize.STRING,
            validate: {
                isEmail: true
            },
        },
        password: {
            type: Sequelize.STRING,
        },
        googleId: {
            type: Sequelize.STRING,
        },
        googleToken: {
            type: Sequelize.STRING,
        },
        googleEmail: {
            type: Sequelize.STRING,
        },
        googleName: {
            type: Sequelize.STRING,
        },
    }
    let modelOptions = {
        hooks: {
            beforeCreate: hashPassword,
        }
    }
    let User = sequelize.define('user', modelDefinition, modelOptions);

    function hashPassword(user) {
        user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(12), null);
    };

    User.prototype.generateHash = function(password) {
        let newPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(12), null);
        return newPassword;
    }

    User.prototype.validPassword = function(password) {
        return bcrypt.compareSync(password, this.password);
    };

    return User;
}