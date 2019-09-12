const models = require('../../models');
const Youtube = require('./youtubeController');

exports = module.exports = io => {
    const rooms = io.of('/rooms');
    rooms.on('connection', function(socket) {
        //connections.push(socket);
        //console.log(`Connected: ${connections.length} sockets connected`);

        //set default room if provided in url
        /*socket.emit('set id', {
            id: given_room,
        });*/
        /*socket.on('disconnect', function(data) {
            
            // If socket username is found
            if (users.indexOf(socket.username) != -1) {
                users.splice(users.indexOf(socket.username), 1);
                updateUsernames();
            }

            connections.splice(connections.indexOf(socket), 1);
            console.log(
                socket.id + ' Disconnected: %s sockets connected',
                connections.length
            );
            // console.log(rooms.sockets.adapter.rooms['room-' + socket.roomnum])
            // console.log(socket.roomnum)

            // HOST DISCONNECT
            // Need to check if current socket is the host of the roomnum
            // If it is the host, needs to auto assign to another socket in the room

            // Grabs room from userrooms data structure
            var id = socket.id;
            var roomnum = userrooms[id];
            var room = rooms.sockets.adapter.rooms['room-' + roomnum];

            // If you are not the last socket to leave
            if (room !== undefined) {
                // If you are the host
                if (socket.id == room.host) {
                    // Reassign
                    console.log(
                        'hello i am the host ' +
                            socket.id +
                            ' and i am leaving my responsibilities to ' +
                            Object.keys(room.sockets)[0]
                    );
                    rooms.to(Object.keys(room.sockets)[0]).emit('autoHost', {
                        roomnum: roomnum,
                    });
                }

                // Remove from users list
                // If socket username is found
                if (room.users.indexOf(socket.username) != -1) {
                    room.users.splice(room.users.indexOf(socket.username), 1);
                    updateRoomUsers(roomnum);
                }
            }

            // Delete socket from userrooms
            delete userrooms[id];
        });
        */

        let userrooms = [];

        socket.on('disconnect', () => {
            let id = socket.id;
            let room = rooms.adapter.rooms['room-' + userrooms[id]];
            //if there are still people in the room
            if (room !== undefined) {
                //if host is leaving
                console.log(typeof socket.id, typeof room.host);
                if (socket.id == room.host) {
                    //reassign host
                    rooms.adapter.rooms[
                        'room-' + userrooms[id]
                    ].host = Object.keys(room.sockets)[0];
                }
            }
            console.log(`Client disconnected, leaving room`);
            delete userrooms[id];
        });

        socket.on('queue video', data => {
            Youtube.search(models, data.search).then(results => {
                rooms.adapter.rooms['room-' + socket.roomnum].queue.yt.push(
                    results
                ); //add video to queue
                updateQueue(); //sends updated queue to clients
            });
        });

        socket.on('next video', () => {
            currVideo = rooms.adapter.rooms[
                'room-' + socket.roomnum
            ].queue.yt.shift(); //shifts next video in queue
            console.log(currVideo);
            if (currVideo !== undefined)
                rooms.adapter.rooms['room-' + socket.roomnum].currVideo =
                    currVideo.videoId; //sets current video of room
            updateQueue(currVideo); //sends updated queue with the currVideo to all clients
        });

        socket.on('restart video', () => {
            rooms.in('room-' + socket.roomnum).emit('restart video');
        });

        socket.on('clear queue', () => {
            rooms.adapter.rooms['room-' + socket.roomnum].queue.yt = []; //empty the queue
            updateQueue(); //send out cleared queue to clients
        });
        socket.on('update queue', data => {
            switch (data.action) {
                case 'remove':
                    rooms.adapter.rooms[
                        'room-' + socket.roomnum
                    ].queue.yt.splice(data.index, 1);
                    break;
            }
            updateQueue();
        });
        socket.on('sync video', data => {
            room = rooms.adapter.rooms['room-' + socket.roomnum];
            if (room.host === socket.id) {
                //manual sync request
                console.log('syncing video time');
                if (data.requestingSocket !== undefined) {
                    socket.to(data.requestingSocket).emit('sync client video', {
                        currentTime: data.currentTime,
                    });
                } else {
                    //sync everyone in room
                    socket.broadcast
                        .in('room-' + socket.roomnum)
                        .emit('sync client video', {
                            currentTime: data.currentTime,
                        });
                }
            }
        });
        socket.on('sync host', () => {
            socket
                .to(rooms.adapter.rooms['room-' + socket.roomnum].host)
                .emit('sync host', { requestingSocket: socket.id });
        });
        socket.on('sync player state', data => {
            room = rooms.adapter.rooms['room-' + socket.roomnum];
            if (room.host === socket.id) {
                console.log('syncing player state');
                socket.broadcast
                    .in('room-' + socket.roomnum)
                    .emit('sync client player state', {
                        playerState: data.playerState,
                    });
            }
        });

        socket.on('new room', (data, callback) => {
            console.log('joined room', rooms.adapter.rooms);
            console.log(data);
            let init = false;
            let host = '';
            //only 1 room for now, the default room
            roomnum = data.roomnum;
            socket.roomnum = roomnum;
            userrooms[socket.id] = socket.roomnum;
            //check if room already exists
            if (rooms.adapter.rooms['room-' + socket.roomnum] === undefined) {
                host = socket.id;
                init = true;
            }
            //join the room
            socket.join('room-' + roomnum);
            if (init) {
                rooms.adapter.rooms['room-' + socket.roomnum].host = host;
                //room was just created so initialize the currVideo and queue
                Youtube.default(models).then(videoId => {
                    rooms.adapter.rooms['room-' + roomnum].currVideo = videoId;
                    callback({ videoId, host: true }); //sets the videoId clientside
                });
                rooms.adapter.rooms['room-' + roomnum].queue = {
                    yt: [],
                };
            } else {
                //room already exists
                callback({
                    videoId: rooms.adapter.rooms['room-' + roomnum].currVideo,
                    host: false,
                });
                setTimeout(
                    () =>
                        socket
                            .to(
                                rooms.adapter.rooms['room-' + socket.roomnum]
                                    .host
                            )
                            .emit('sync host', { requestingSocket: socket.id }),
                    1700
                );
                //send the currVideo id to the client
            }
            //setInterval(pingClient, 5000);
            updateQueue(); //sends the queue

            //data is the room number
            /*socket.roomnum = data;
            userrooms[socket.id] = data;

            let host = null;
            let init = false;

            if (socket.roomnum == null || socket.roomnum == '') {
                socket.roomnum = '1';
                userrooms[socket.id] = '1';
            }

            if (rooms.includes(socket.roomnum) === false) {
                rooms.push(socket.roomnum);
            }
            //if room doesn't exist
            if (
                rooms.sockets.adapter.rooms['room-' + socket.roomnum] === undefined
            ) {
                socket.send(socket.id);
                host = socket.id;
                init = true;

                socket.emit('setHost');
            } else {
                host = rooms.sockets.adapter.rooms['rooms-' + socket.roomnum].host;
            }

            //join the room
            socket.join('room-' + socket.roomnum);

            if (init) {
                room = 'room-' + socket.roomnum;
                //sets the host
                rooms.sockets.adapter.rooms[room].host = host;
                //default player
                rooms.sockets.adapter.rooms[room].currPlayer = 0;
                //default video
                rooms.sockets.adapter.rooms[room].currVideo = {
                    yt: 'M7lc1UVf-VE',
                };
                //host username
                rooms.sockets.adapter.rooms[room].hostName = socket.username;
                //keep list of online users
                rooms.sockets.adapter.rooms[room] = [socket.username];
                //set an empty queue
                rooms.sockets.adapter.rooms[room].queue = {
                    yt: [],
                };
            }

            //set host label
            rooms.sockets.in(room).emit('changeHostLabel', {
                username: rooms.sockets.adapter.rooms[room].hostName,
            });

            updateQueueVideos(); //gets the queue and player from the socket and sends it to the client

            //gets current video from room variable
            switch (rooms.sockets.adapter.rooms[room].currPlayer) {
                case 0:
                    let currVideo = rooms.sockets.adapter.rooms[room].currVideo.yt;
                    break;
                default:
                    console.log('Error invalid player id');
            }

            switch (rooms.sockts.adapter.rooms[room].currPlayer) {
                case 0:
                    //yt is default so do nothing
                    break;
                default:
                    console.log('Error invalid player id');
            }

            socket.emit('changeVideoClient', {
                videoId: currVideo,
            });

            //get time from host which calls change time for that socket
            if (socket.id !== host) {
                console.log('call the damn host', host);

                //set a timeout so the video can load before it syncs
                setTimeout(() => {
                    socket.broadcast.to(host).emit('getData');
                }, 1000);

                //push to users in the room
                rooms.sockets.adapter.rooms[room].users.push(socket.username);
            } else {
                //auto syncing, not yet implemented
                console.log('I am the host');
            }

            updateRoomUsers(socket.roomnum); //gets the users in a room and sends the data to the client
            */
        });

        socket.on('join', function(channel, ack) {
            //if already in room, leave the room
            let connectedChannels = Object.keys(socket.rooms);
            if (connectedChannels.length > 1) {
                socket.leave(connectedChannels[0]);
            }
            socket.roomnum = channel;
            //join new room
            socket.join(channel);

            socket.broadcast
                .to(channel)
                .emit('message', 'someone has joined this channel');
            ack();
            console.log(`joined ${channel}`);
        });

        socket.on('message', function(msg) {
            var channel = Object.keys(socket.rooms);
            //if connected to channel, broadcast message
            if (channel.length > 1) {
                rooms.to(channel[0]).emit('message', msg);
            }
            //otherwise emit error because client is not connected to a channel
            else rooms.to(channel[0]).emit('error', 'not connected to a room');
        });

        function pingClient() {
            console.log('pinging');
            if (rooms.adapter.rooms['room-' + socket.roomnum] !== undefined) {
                host = rooms.adapter.rooms['room-' + socket.roomnum].host;
                rooms.adapter.rooms['room-' + socket.roomnum].time = Date.now();
                rooms.to(host).emit('pinging');
            }
        }

        socket.on('ponging', () => {
            console.log(
                'pong',

                Date.now() - rooms.adapter.rooms['room-' + socket.roomnum].time
            );
        });

        function updateQueue(currVideo = null) {
            //only runs if the room exists
            currVideo === null || currVideo === undefined
                ? (videoId = null)
                : (videoId = currVideo.videoId);
            if (rooms.adapter.rooms['room-' + socket.roomnum] !== undefined) {
                let queue =
                    rooms.adapter.rooms['room-' + socket.roomnum].queue.yt;
                rooms
                    .in('room-' + socket.roomnum)
                    .emit('get queue', { queue, videoId }); //emit the current queue and video
            }
        }
    });
};
