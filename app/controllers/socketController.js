const models = require('../../models');
const Youtube = require('./youtubeController');

exports = module.exports = io => {
    io.sockets.on('connection', function(socket) {
        //connections.push(socket);
        //console.log(`Connected: ${connections.length} sockets connected`);

        //set default room if provided in url
        /*socket.emti('set id', {
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
            // console.log(io.sockets.adapter.rooms['room-' + socket.roomnum])
            // console.log(socket.roomnum)

            // HOST DISCONNECT
            // Need to check if current socket is the host of the roomnum
            // If it is the host, needs to auto assign to another socket in the room

            // Grabs room from userrooms data structure
            var id = socket.id;
            var roomnum = userrooms[id];
            var room = io.sockets.adapter.rooms['room-' + roomnum];

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
                    io.to(Object.keys(room.sockets)[0]).emit('autoHost', {
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
        socket.on('disconnect', () => {
            console.log(`Client disconnected, leaving room`);
        });

        socket.on('get video', callback => {
            let currVideo =
                io.sockets.adapter.rooms['room-' + socket.roomnum].currVideo;
            console.log(currVideo);
            callback(currVideo);
        });
        socket.on('queue video', data => {
            Youtube.search(models, data.search).then(results => {
                io.sockets.adapter.rooms[
                    'room-' + socket.roomnum
                ].queue.yt.push(results);
                updateQueue();
            });
        });
        socket.on('next video', () => {
            let currVideo = io.sockets.adapter.rooms[
                'room-' + socket.roomnum
            ].queue.yt.shift();
            io.sockets.adapter.rooms['room-' + socket.roomnum].currVideo =
                currVideo.videoId;
            updateQueue(currVideo.videoId);
        });
        socket.on('restart video', () => {
            io.sockets.in('room-' + socket.roomnum).emit('restart video');
        });
        socket.on('new room', callback => {
            console.log('joined room');
            let init = false;
            //only 1 room for now
            roomnum = 1;
            socket.roomnum = roomnum;
            //check if room already exists
            if (io.sockets.adapter.rooms['room-' + roomnum] === undefined) {
                init = true;
            }
            //join the room
            socket.join('room-' + roomnum);
            console.log('rooms', io.sockets.adapter.rooms);
            if (init) {
                Youtube.default(models).then(videoId => {
                    io.sockets.adapter.rooms[
                        'room-' + roomnum
                    ].currVideo = videoId;
                    callback(videoId);
                });
                io.sockets.adapter.rooms['room-' + roomnum].queue = {
                    yt: [],
                };
            } else {
                callback(io.sockets.adapter.rooms['room-' + roomnum].currVideo);
            }
            updateQueue();
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
                io.sockets.adapter.rooms['room-' + socket.roomnum] === undefined
            ) {
                socket.send(socket.id);
                host = socket.id;
                init = true;

                socket.emit('setHost');
            } else {
                host = io.sockets.adapter.rooms['rooms-' + socket.roomnum].host;
            }

            //join the room
            socket.join('room-' + socket.roomnum);

            if (init) {
                room = 'room-' + socket.roomnum;
                //sets the host
                io.sockets.adapter.rooms[room].host = host;
                //default player
                io.sockets.adapter.rooms[room].currPlayer = 0;
                //default video
                io.sockets.adapter.rooms[room].currVideo = {
                    yt: 'M7lc1UVf-VE',
                };
                //host username
                io.sockets.adapter.rooms[room].hostName = socket.username;
                //keep list of online users
                io.sockets.adapter.rooms[room] = [socket.username];
                //set an empty queue
                io.sockets.adapter.rooms[room].queue = {
                    yt: [],
                };
            }

            //set host label
            io.sockets.in(room).emit('changeHostLabel', {
                username: io.sockets.adapter.rooms[room].hostName,
            });

            updateQueueVideos(); //gets the queue and player from the socket and sends it to the client

            //gets current video from room variable
            switch (io.sockets.adapter.rooms[room].currPlayer) {
                case 0:
                    let currVideo = io.sockets.adapter.rooms[room].currVideo.yt;
                    break;
                default:
                    console.log('Error invalid player id');
            }

            switch (io.sockts.adapter.rooms[room].currPlayer) {
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
                io.sockets.adapter.rooms[room].users.push(socket.username);
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
                io.to(channel[0]).emit('message', msg);
            }
            //otherwise emit error because client is not connected to a channel
            else io.to(channel[0]).emit('error', 'not connected to a room');
        });
        function updateQueue(videoId = null) {
            if (
                io.sockets.adapter.rooms['room-' + socket.roomnum] !== undefined
            ) {
                let queue =
                    io.sockets.adapter.rooms['room-' + socket.roomnum].queue.yt;
                io.sockets
                    .in('room-' + socket.roomnum)
                    .emit('get queue', { queue, videoId });
            }
        }
    });
};
