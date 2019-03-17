var Sequelize = require('sequelize');

var config = require('./../config'),
    db = require('./../services/database');


// DB Schema for users table
var modelDefinition = {
    username: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    }
};
const UserModel = db.define('user', modelDefinition);

module.exports = UserModel;

/*db.sync()
    .then(() => UserModel.create({
      "username": 'user1',
      "email": 'user1@test.com',
      "password": 'testpassword'
    }))
    .catch(function(error) {
        console.log(error);
    });*/