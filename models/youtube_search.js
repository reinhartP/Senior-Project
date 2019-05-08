module.exports = (sequelize, Sequelize) => {
    let modelDefinition = {
        search_string: {
            type: Sequelize.STRING
        },
        title: {
            type: Sequelize.STRING
        },
        thumbnail: {
            type: Sequelize.STRING
        },
        etag: {
            type: Sequelize.STRING
        },
        youtube_id: {
            type: Sequelize.STRING
        },
    };
    
    return YoutubeSearch = sequelize.define('youtube_search', modelDefinition, { charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' })
}