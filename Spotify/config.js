var config = module.exports;

config.db = {
    user: 'root',
    password: 'rootPassword',
    name: 'spotifydb',
};

config.db.details = {
    host: 'localhost',
    dialect: 'mysql',
    logging: false,
    pool: {
        max: 50,
        min: 5,
        acquire: 100000,
    }
};