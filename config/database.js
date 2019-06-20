require('dotenv').config();

const development = {
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    host: process.env.DATABASE_HOST,
    port: '3306',
    dialect: 'mysql',
    define: {
        underscored: true,
    },
    dialectOptions: {
        ssl: 'Amazon RDS',
    },
    logging: false,
    pool: {
        max: 50,
        min: 0,
        idle: 10000,
        acquire: 50000,
    },
};
const test = {
    username: '',
    password: null,
    database: '',
    host: '',
    dialect: 'mysql',
};

const production = {
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    host: process.env.DATABASE_HOST,
    port: '3306',
    dialect: 'mysql',
    define: {
        underscored: true,
    },
    dialectOptions: {
        ssl: 'Amazon RDS',
    },
    logging: false,
    pool: {
        max: 50,
        min: 0,
        idle: 10000,
        acquire: 50000,
    },
};

const config = {
    development,
    test,
    production,
};

module.exports = config;
