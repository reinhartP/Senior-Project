const Sequelize = require('sequelize');
const op = Sequelize.Op;
const request = require('request-promise-native');
const moment = require('moment');

var exports = module.exports = {};

exports.search = async function(searchString) {
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
            return await fetchResult(options);
            }
        catch(err) {
            console.log(err);
        }
    }

    const fetchResult = async(options) => {
        const data = await request.get(options).catch(err => console.log(err));
        return data;
    }

    return await main().then(value => value.items[0].id.videoId);
};

exports.default = async function(models) {
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
            if(!query) {    //table needs to be updated because older then a day or empty
                const data = await fetchTopSongs(options);

                for(let i = 0; i < data.items.length; i++) {
                    videos.items[i] = {};
                    videos.items[i].id = data.items[i].id;
                }
                await addVideos(videos);
            }
            else {          //table is less then 1 day old
                for(let i = 0; i < query.length; i++) {
                    videos.items[i] = {};
                    videos.items[i].id = query[i].dataValues.youtube_id;
                }
            }
            let rand = Math.floor(Math.random()*videos.items.length);
            return videos.items[rand].id;
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
            if(data[0]) {                               //check time if items are in table
                let lastUpdated = moment(data[0].dataValues.updatedAt).fromNow();
                if(lastUpdated.includes('day')) {       //time since last update > 1 day
                    return false;
                }
                else {                                  //less then 1 day return what's in the table
                    return data;
                }
            }
            else {                                      //table is empty
                return false;
            }
        })
        return data;
    }

    const addVideos = async(videos) => {
        for(let i = 0; i < videos.items.length; i++) {
            TopSong.findOne({
                where: {
                    id: i+1,
                }
            }).then(foundItem => {
                if(!foundItem) {    //item not found
                    TopSong.create({
                        youtube_id: videos.items[i].id,
                    })
                }
                else {              //found item, update it
                    TopSong.update({
                        youtube_id: videos.items[i].id,
                    }, {
                        where: {
                            id: i+1,
                        }
                    })
                }
            })
        }
    }

    const fetchTopSongs = async(options) => {
        const data = await request.get(options).catch(err => console.log(err));
        return data;
    }
    
    return await main().then(videoId => videoId);
};
