const Sequelize = require('sequelize');
const op = Sequelize.Op;
const request = require('request-promise-native');
const moment = require('moment');

var exports = module.exports = {};

exports.search = async function(searchString, callback) {
    console.log(searchString);
    let options = {
        url: 'https://www.googleapis.com/youtube/v3/search?',
        qs: {
            part: 'id',
            type: 'video',
            videoCategoryId: '10',
            maxResults: '10',
            key: process.env.YOUTUBE_API_KEY,
            q: searchString,
        },
        json: true
    };

    async function main() {
        try{
            const data = await fetchResult(options);
            callback(data.items[0].id)
            //callback('2S24-y0Ij3Y')
            }
        catch(err) {
            console.log(err);
        }
    }

    const fetchResult = async(options) => {
        const data = await request.get(options).catch(err => console.log(err));
        return data;
    }
    main();
};

exports.default = async function(models, callback) {
    let TopSong = models.top_song;
    let options = {
        url: 'https://www.googleapis.com/youtube/v3/videos?',
        qs: {
            part: 'id',
            chart: 'mostPopular',
            maxResults: '10',
            videoCategoryId: '10',
            key: process.env.YOUTUBE_API_KEY,
        },
        json: true
    };

    async function main() {
        try{
            const query = await checkTime();
            videos = {
                "items": []
            };
            if(!query) {
                
                const data = await fetchTopSongs(options);
                
                for(let i = 0; i < data.items.length; i++) {
                    videos.items[i] = {};
                    videos.items[i].id = data.items[i].id;
                }
                await addVideos(videos);
            }
            else {
                for(let i = 0; i < query.length; i++) {
                    videos.items[i] = {};
                    videos.items[i].id = query[i].dataValues.youtube_id;
                }
            }
            let rand = Math.floor(Math.random()*videos.items.length);
            callback(videos.items[rand].id)
            }
        catch(err) {
            console.log(err);
        }
    }

    const checkTime = async() => {
        const data = TopSong.findAll({
            where: {
                id: {[op.like]: '%'}
            }
        }).then(data => {
            let lastUpdated = moment(data[0].dataValues.updatedAt).fromNow();
            if(lastUpdated.includes('day')) {
                return false;
            }
            else {
                return data;
            }
        })

        return data;
    }

    const addVideos = async(videos) => {
        for(let i = 0; i < videos.items.length; i++) {
            TopSong.update({
                youtube_id: videos.items[i].id,
            }, {
                where: {
                    id: i+1,
                }
            });
        }

        /*videos.items.forEach((videoId) => {         //creates initial 10 entries
            TopSong.create({
                youtube_id: videoId.id,
            })
            .catch(err => console.log(err));
        })*/
    }

    const fetchTopSongs = async(options) => {
        const data = await request.get(options).catch(err => console.log(err));
        return data;
    }
    
    main();
};
