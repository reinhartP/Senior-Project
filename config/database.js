const fs = require('fs');
let rdsCa;
let gcpCa;
let gcpCert;
let gcpKey;
if (process.env.NODE_ENV !== 'production') {
    rdsCa = fs.readFileSync(__dirname + '/rds-combined-ca-bundle.pem');
    gcpCa = fs.readFileSync(__dirname + '/server-ca.pem');
    gcpCert = fs.readFileSync(__dirname + '/client-cert.pem');
    gcpKey = fs.readFileSync(__dirname + '/client-key.pem');
}

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
        ssl: {
            rejectUnauthorized: true,
            //ca: [rdsCa],
            ca: [gcpCa],
            key: [gcpKey],
            cert: [gcpCert],
        },
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
    username: 'root',
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    host: process.env.DATABASE_HOST,
    port: '3306',
    dialect: 'mysql',
    define: {
        underscored: true,
    },
    dialectOptions: {
        ssl: {
            rejectUnauthorized: true,
            ca: [gcpCa],
            key: [gcpKey],
            cert: [gcpCert],
        },
    },
    logging: false,
    pool: {
        max: 50,
        min: 0,
        idle: 10000,
        acquire: 50000,
    },
};

const production = {
    username: 'root',
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    host: process.env.DATABASE_HOST,
    port: '3306',
    dialect: 'mysql',
    define: {
        underscored: true,
    },
    dialectOptions: {
        ssl: {
            rejectUnauthorized: true,
            //ca: [rdsCa],
            ca: process.env.CA_CERT,
            key: process.env.CLIENT_KEY,
            cert: process.env.CLIENT_CERT,
        },
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

/*connect to gcp with   mysql -uroot -p -h 35.230.76.188 \
    --ssl-ca=server-ca.pem --ssl-cert=client-cert.pem \
    --ssl-key=client-key.pem
    */
