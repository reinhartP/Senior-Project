require('dotenv').config();

const development = {
        "username": process.env.DATABASE_USERNAME,
        "password": process.env.DATABASE_PASSWORD,
        "database": process.env.DATABASE_NAME,
        "host": process.env.DATABASE_HOST,
        "port": "3306",
        "dialect": "mysql",
        "dialectOptions": {
                "ssl": 'Amazon RDS'
        },
        "logging": false,
        "pool": {
            "max": 50,
            "min": 5,
            "acquire": 100000
        }
};
const test = {
        "username": "",
        "password": null,
        "database": "",
        "host": "",
        "dialect": "mysql"
};
 
const production = {
        "username": "",
        "password": null,
        "database": "",
        "host": "127.0.0.1",
        "dialect": "mysql"
};

const config = {
    development,
    test,
    production
};

module.exports = config;