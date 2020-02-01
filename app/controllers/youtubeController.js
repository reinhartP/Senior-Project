const Sequelize = require('sequelize');
const op = Sequelize.Op;
const request = require('request-promise-native');
const moment = require('moment');

var exports = (module.exports = {});

exports.search = async function(models, searchString) {
    let YoutubeSearch = models.youtube_search;
    let options = {
        url: 'https://www.googleapis.com/youtube/v3/search',
        qs: {
            part: 'snippet',
            type: 'video',
            //videoCategoryId: '10', only lyric videos show up sometimes with restricted category
            maxResults: '1',
            key: process.env.YOUTUBE_API_KEY4,
            q: searchString,
        },
        json: true,
    };

    async function main() {
        try {
            return await searchVideo(); //return search results from youtube api
        } catch (err) {
            console.log(err);
        }
    }

    const searchVideo = async () => {
        const data = await YoutubeSearch.findOne({
            where: {
                [op.or]: {
                    search_string: {
                        [op.like]: searchString,
                    },
                    title: {
                        [op.like]: searchString,
                    },
                },
            },
            raw: true,
        });
        if (data !== null) {
            //search found in table
            console.log('value found in search table');
            options.headers = {};
            options.headers['If-None-Match'] = data.etag; //set etag in header
            const results = await fetchResult(options); //check if data has changed
            if (typeof results.statusCode === 'undefined') {
                console.log('update search table');
                await YoutubeSearch.update(
                    {
                        title: results.title,
                        thumbnail: results.thumbnail,
                        etag: results.etag,
                        youtube_id: results.videoId,
                    },
                    {
                        where: {
                            id: data.id,
                        },
                    }
                );
                return {
                    videoId: results.videoId,
                    title: results.title,
                    thumbnail: results.thumbnail,
                };
            }
            let video = {
                videoId: data.youtube_id,
                title: data.title,
                thumbnail: data.thumbnail,
            };
            return video;
        } else {
            //no match found in table
            console.log('no match found in search table');
            const video = await fetchResult(options);
            await YoutubeSearch.create({
                search_string: searchString,
                title: video.title,
                thumbnail: video.thumbnail,
                etag: video.etag,
                youtube_id: video.videoId,
            });
            return video;
        }
    };

    const fetchResult = async options => {
        const data = await request.get(options).catch(err => {
            console.log('+1');
            return { statusCode: err.statusCode };
        });
        let video = data;

        if (typeof data.statusCode === 'undefined') {
            //old values out of date, update
            console.log('+100');
            video = {
                etag: data.etag,
                videoId: data.items[0].id.videoId,
                title: data.items[0].snippet.title
                    .replace(/&quot;/g, '"')
                    .replace(/&#39;/g, "'"),
                thumbnail: data.items[0].snippet.thumbnails.medium.url,
            };
        }
        return video;
    };
    return await main().then(video => {
        //return first result from youtube api
        return video;
    });
};

exports.default = async function(models) {
    let TopSong = models.top_song;
    let options = {
        url: 'https://www.googleapis.com/youtube/v3/videos',
        qs: {
            part: 'id',
            chart: 'mostPopular',
            maxResults: '10',
            videoCategoryId: '10',
            key: process.env.YOUTUBE_API_KEY4,
        },
        json: true,
    };

    async function main() {
        try {
            const query = await checkTime();
            videos = {
                items: [],
            };
            if (!query) {
                //table needs to be updated because older then a day or empty
                const data = await fetchTopSongs(options);

                for (let i = 0; i < data.items.length; i++) {
                    videos.items[i] = {};
                    videos.items[i].id = data.items[i].id;
                }
                await addVideos(videos);
            } else {
                //table is less then 1 day old
                for (let i = 0; i < query.length; i++) {
                    videos.items[i] = {};
                    videos.items[i].id = query[i].dataValues.youtube_id;
                }
            }
            let rand = Math.floor(Math.random() * videos.items.length);
            return videos.items[rand].id;
        } catch (err) {
            console.log(err);
        }
    }

    const checkTime = async () => {
        const data = TopSong.findAll({
            where: {
                id: { [op.like]: '%' },
            },
        }).then(data => {
            if (data[0]) {
                //check time if items are in table
                let lastUpdated = moment(
                    data[0].dataValues.updatedAt
                ).fromNow();
                if (lastUpdated.includes('day')) {
                    //time since last update > 1 day
                    return false;
                } else {
                    //less then 1 day return what's in the table
                    return data;
                }
            } else {
                //table is empty
                return false;
            }
        });
        return data;
    };

    const addVideos = async videos => {
        for (let i = 0; i < videos.items.length; i++) {
            TopSong.findOne({
                where: {
                    id: i + 1,
                },
            }).then(foundItem => {
                if (!foundItem) {
                    //item not found
                    TopSong.create({
                        youtube_id: videos.items[i].id,
                    });
                } else {
                    //found item, update it
                    TopSong.update(
                        {
                            youtube_id: videos.items[i].id,
                        },
                        {
                            where: {
                                id: i + 1,
                            },
                        }
                    );
                }
            });
        }
    };

    const fetchTopSongs = async options => {
        const data = await request.get(options).catch(err => console.log(err));
        return data;
    };

    return await main().then(videoId => videoId);
};
