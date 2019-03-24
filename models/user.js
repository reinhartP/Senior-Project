const bcrypt = require('bcrypt-nodejs');

module.exports = (sequelize, Sequelize) => {
    let modelDefinition = {
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey:  true,
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
        google_id: {
            type: Sequelize.STRING,
        },
        google_token: {
            type: Sequelize.STRING,
        },
        google_email: {
            type: Sequelize.STRING,
        },
        google_name: {
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