import React, { Component } from 'react';
import axios from 'axios';
import Player from 'react-youtube';
import socketIOClient from 'socket.io-client';
import {
    Button,
    Container,
    Grid,
    GridColumn,
    GridRow,
    Tab,
    Menu,
    Card,
} from 'semantic-ui-react';
import { asyncContainer, Typeahead } from 'react-bootstrap-typeahead';
import { Helmet } from 'react-helmet';
import './Youtube.css';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import 'react-bootstrap-typeahead/css/Typeahead-bs4.css';
import Navbar from '../components/Navbar';
const AsyncTypeahead = asyncContainer(Typeahead);

function Queue(props) {
    if (props.videoPlaylist.length > 0) {
        return (
            <div>
                {props.videoPlaylist.map((video, index) => {
                    return (
                        <div
                            className="ui small image"
                            style={{
                                textAlign: 'center',
                                marginTop: '5px',
                                paddingLeft: '5px',
                                paddingRight: '5px',
                                whiteSpace: 'normal',
                                verticalAlign: 'top',
                            }}
                        >
                            <Button
                                as="a"
                                className="ui red right corner label"
                                style={{
                                    overflow: 'hidden',
                                    marginLeft: '5px',
                                    marginRight: '5px',
                                }}
                                onClick={() => props.removeFromQueue(index)}
                            >
                                <i className="times circle icon" />
                            </Button>
                            <img
                                className="ui small rounded centered image"
                                src={video.thumbnail}
                            />
                            <p style={{ color: 'white' }}>
                                {video.title.substring(
                                    0,
                                    video.title.length > 35
                                        ? 35
                                        : video.title.length
                                )}
                            </p>
                        </div>
                    );
                })}
            </div>
        );
    }
    return <div />;
}

function PlaylistSongs(props, handleClick) {
    let panes = [];
    props.map((playlist, index) => {
        panes[index] = {};
        panes[index].menuItem = playlist[0].playlist_name;
        panes[index].render = () => (
            <Tab.Pane
                inverted
                style={{
                    height: '615px',
                    overflowY: 'scroll',
                }}
            >
                <Menu
                    vertical
                    inverted
                    size="tiny"
                    style={{
                        width: '100%',
                    }}
                >
                    {playlist.map((song, songIndex) => (
                        <Menu.Item
                            key={playlist[0].playlist_name + songIndex}
                            onClick={() => {
                                handleClick(
                                    `${song.song_name} - ${song.artist_name}`
                                );
                            }}
                        >
                            {song.song_name} - {song.artist_name}
                        </Menu.Item>
                    ))}
                </Menu>
            </Tab.Pane>
        );
    });
    return panes;
}

class Youtube extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchString: '',
            videoId: '',
            username: '',
            userPlaylists: [],
            videoPlaylist: [],
            isLoading: true,
            player: null,
            options: [],
            socket: undefined,
            width: 0,
            height: 0,
            host: false,
        };
        this.onStateChange = this.onStateChange.bind(this);
        this.onReady = this.onReady.bind(this);
        this.searchSong = this.searchSong.bind(this);
        this.nextSong = this.nextSong.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.removeFromQueue = this.removeFromQueue.bind(this);
        this.clearQueue = this.clearQueue.bind(this);
        this.syncHost = this.syncHost.bind(this);
        this.handlePlaylistClick = this.handlePlaylistClick.bind(this);
    }

    async componentDidMount() {
        document.body.style.background = '#202124';
        let accessString = localStorage.getItem('jwtToken');
        await axios
            .get('api/me', {
                headers: { Authorization: `JWT ${accessString}` },
            })
            .then(response => {
                if (response !== null)
                    this.setState({
                        username: response.data.username,
                    });
            });
        if (this.state.username !== undefined)
            await axios
                .get(`api/user/playlists?user=${this.state.username}`)
                .then(response => {
                    if (response !== null)
                        this.setState({
                            userPlaylists: response.data,
                        });
                })
                .then(() => this.sortSongs());
        const socket = socketIOClient('/rooms');
        this.setState({
            socket: socket,
        });
        //url is now /youtube/:id where id is the room id
        //if not id is defined then it will redirect to /room where they can specify a room id or be assigned one at random
        socket.emit('new room', { roomnum: this.props.id }, data => {
            this.setState({
                videoId: data.videoId,
                host: data.host,
                isLoading: false,
            });
        });
        socket.on('get queue', data => {
            this.setState({
                videoPlaylist: data.queue,
                videoId:
                    data.videoId === null ? this.state.videoId : data.videoId,
                searchString: '', //maybe move this somewhere else
            });
        });
        socket.on('restart video', () => {
            this.state.player.seekTo(0, true);
        });
        socket.on('sync client video', data => {
            let currentTime = this.state.player.getCurrentTime();
            if (Math.abs(currentTime - data.currentTime) > 0.2) {
                this.state.player.seekTo(data.currentTime);
                this.state.player.playVideo();
            }
        });
        socket.on('sync client player state', data => {
            let currentState = this.state.player.getPlayerState();
            if (data.playerState === 1) {
                if (currentState === -1 || currentState === 2) {
                    this.state.player.playVideo();
                }
            } else this.state.player.pauseVideo();
        });
        socket.on('sync host', data => {
            this.state.socket.emit('sync video', {
                currentTime: this.state.player.getCurrentTime(),
                requestingSocket:
                    data.requestingSocket !== undefined
                        ? data.requestingSocket
                        : undefined,
            });
        });
        socket.on('pinging', () => {
            socket.emit('ponging');
        });
    }
    playerSeek(time) {
        this.state.player.seekTo(time);
    }
    onReady(e) {
        this.setState({
            player: e.target,
        });
        this.state.player.setVolume(25);
    }

    onStateChange(player) {
        switch (player.data) {
            case 0:
                if (this.state.videoPlaylist.length === 0) {
                    this.state.socket.emit('restart video');
                } else {
                    this.state.socket.emit('next video');
                }
                break;
            case 1:
                this.state.socket.emit('sync player state', {
                    playerState: player.data,
                });
                break;
            case 2:
                this.state.socket.emit('sync player state', {
                    playerState: player.data,
                });
                break;
            case 3:
                this.state.socket.emit('sync video', {
                    currentTime: this.state.player.getCurrentTime(),
                });

                break;
        }
    }

    sortSongs(type = 'artist asc') {
        function compareArtist(a, b) {
            if (a.artist_name > b.artist_name) return 1;
            return -1;
        }
        function compareSong(a, b) {
            let songA = a.song_name.toUpperCase();
            let songB = b.song_name.toUpperCase();
            if (songA < songB) return 1;
            return -1;
        }
        if (this.state.userPlaylists.length > 0)
            switch (type) {
                case 'artist asc':
                    this.setState(currentState => {
                        currentState.userPlaylists.forEach(
                            (playlist, index) => {
                                playlist.sort(compareSong);
                                playlist.sort(compareArtist);
                            }
                        );
                        return {
                            userPlaylists: currentState.userPlaylists,
                        };
                    });
                    break;
            }
    }

    handleInputChange = input => {
        //user typing
        this.setState({
            searchString: input,
        });
    };

    handleChange = input => {
        //user selects menu item
        if (input.length > 0)
            this.setState({
                searchString: input[0].song_name + ' - ' + input[0].artist_name,
            });
    };

    handleOnKeyDown = event => {
        if (event.keyCode === 13) {
            this.searchSong(event);
        }
    };
    handlePlaylistClick(searchString) {
        let socket = this.state.socket;
        socket.emit('queue video', { search: searchString });
    }
    searchSong(e) {
        e.preventDefault();
        this.typeahead.getInstance().clear();
        let socket = this.state.socket;
        socket.emit('queue video', { search: this.state.searchString });
    }

    nextSong() {
        this.onStateChange({ data: 0 });
    }

    clearQueue() {
        let socket = this.state.socket;
        socket.emit('clear queue');
    }

    syncHost() {
        this.state.socket.emit('sync host');
    }
    removeFromQueue(index) {
        this.state.socket.emit('update queue', { action: 'remove', index });
        this.setState(currentState => {
            currentState.videoPlaylist.splice(index, 1);
            return {
                videoPlaylist: currentState.videoPlaylist,
            };
        });
    }

    render() {
        const opts = {
            playerVars: {
                autoplay: 1,
            },
        };

        return (
            <Container fluid={true}>
                <Grid
                    style={{
                        height: '95vh',
                        display: 'flex',
                        flexDirection: 'column',
                        flexWrap: 'nowrap',
                        justifyContent: 'flex-start',
                    }}
                    centered
                    columns="equal"
                    stackable
                >
                    {/*search and add to queue row*/}
                    <GridRow
                        centered
                        columns={2}
                        style={{
                            height: '33.5px',
                            paddingTop: '0px',
                            paddingBottom: '0px',
                        }}
                    >
                        <GridColumn width={4}>
                            <div className="input-group">
                                <AsyncTypeahead
                                    ref={typeahead =>
                                        (this.typeahead = typeahead)
                                    }
                                    placeholder="Search for a song"
                                    align="left"
                                    autoFocus={true}
                                    onInputChange={this.handleInputChange}
                                    onChange={this.handleChange}
                                    autoComplete="off"
                                    id="realtimeSearch"
                                    useCache={true}
                                    isLoading={this.state.isLoading}
                                    onSearch={query => {
                                        this.setState({ isLoading: true });
                                        axios
                                            .get(`api/search?key=${query}`)
                                            .then(response =>
                                                this.setState({
                                                    isLoading: false,
                                                    options: response.data,
                                                })
                                            );
                                    }}
                                    labelKey={option => {
                                        return `${option.song_name} - ${option.artist_name}`;
                                    }}
                                    options={this.state.options}
                                />
                                <span className="input-group-btn">
                                    <Button
                                        className="inverted green small right attached"
                                        type="submit"
                                        onClick={this.searchSong}
                                        onMouseDown={e => e.preventDefault()}
                                    >
                                        Add to queue
                                    </Button>
                                </span>
                            </div>
                        </GridColumn>
                    </GridRow>

                    <GridRow
                        columns={3}
                        style={{
                            paddingTop: '0px',
                            paddingBottom: '0px',
                            maxHeight: '756px',
                            height: '100%',
                            minHeight: '200px',
                        }}
                    >
                        {' '}
                        {/*player row*/}
                        <GridColumn
                            width={3}
                            style={{
                                paddingRight: '0px',
                                paddingLeft: '0px',

                                overflowY: 'scroll',
                            }}
                        />
                        <GridColumn
                            width={10}
                            style={{
                                maxWidth: '1280px',
                                minHeight: '200px',
                                paddingLeft: '5px',
                                paddingRight: '5px',
                            }}
                        >
                            <Player
                                containerClassName="youtubePlayer justify-content-center"
                                id="player"
                                videoId={this.state.videoId}
                                opts={opts}
                                onReady={this.onReady}
                                onStateChange={this.onStateChange}
                            />
                            <GridRow style={{ height: '36px' }}>
                                <Button
                                    className="inverted green small"
                                    floated="left"
                                    onClick={this.syncHost}
                                    onMouseDown={e => e.preventDefault()}
                                >
                                    Sync Host
                                </Button>
                                <Button
                                    className="inverted green small"
                                    floated="right"
                                    onClick={() => {
                                        this.nextSong({ data: 0 });
                                    }}
                                    onMouseDown={e => e.preventDefault()}
                                >
                                    Next Song
                                </Button>
                                <Button
                                    className="inverted green small"
                                    floated="right"
                                    onClick={this.clearQueue}
                                    onMouseDown={e => e.preventDefault()}
                                >
                                    Clear queue
                                </Button>
                            </GridRow>
                            <GridRow
                                style={{
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                <Card
                                    style={{
                                        backgroundColor: '#202124',
                                        borderColor: '#202124',
                                        visibility:
                                            this.state.videoPlaylist.length ===
                                            0
                                                ? 'hidden'
                                                : 'visible',
                                        display: 'flex',
                                        minWidth: '100%',
                                        overflowX: 'scroll',
                                    }}
                                >
                                    <Queue
                                        videoPlaylist={this.state.videoPlaylist}
                                        removeFromQueue={this.removeFromQueue}
                                    />
                                </Card>
                            </GridRow>
                        </GridColumn>
                        <GridColumn
                            width={3}
                            style={{
                                paddingRight: '0px',
                                paddingLeft: '0px',
                                height: '100%',
                            }}
                        >
                            <Tab
                                menu={{
                                    inverted: true,
                                    attached: true,
                                    tabular: false,
                                }}
                                style={{ height: '100%', paddingRight: '20px' }}
                                panes={[
                                    {
                                        menuItem: 'Chat',
                                        render: () => (
                                            <Tab.Pane
                                                inverted
                                                style={{ height: '680px' }}
                                            >
                                                Placeholder
                                            </Tab.Pane>
                                        ),
                                    },
                                    {
                                        menuItem: 'Playlists',
                                        render: () => {
                                            if (
                                                this.state.userPlaylists
                                                    .length > 0
                                            )
                                                return (
                                                    <Tab
                                                        className="playlist-tab"
                                                        size="small"
                                                        menu={{
                                                            inverted: true,
                                                            attached: false,
                                                            secondary: true,
                                                        }}
                                                        style={{
                                                            maxWidth: '480px',
                                                            height: '100%',
                                                        }}
                                                        panes={PlaylistSongs(
                                                            this.state
                                                                .userPlaylists,
                                                            this
                                                                .handlePlaylistClick
                                                        )}
                                                    />
                                                );
                                            return (
                                                <Tab.Pane
                                                    inverted
                                                    style={{ height: '680px' }}
                                                >
                                                    Login or Signup and sync
                                                    your Spotify playlists to
                                                    view your playlists.
                                                </Tab.Pane>
                                            );
                                        },
                                    },
                                ]}
                            />
                        </GridColumn>
                    </GridRow>
                    <GridRow
                        vertialAlign="bottom"
                        centered
                        columns={3}
                        style={{ paddingTop: '10px' }}
                    >
                        {' '}
                        {/*placeholder, row under video*/}
                        <GridColumn
                            width={10}
                            style={{ paddingRight: '0px', paddingLeft: '0px' }}
                        >
                            <Grid
                                columns={2}
                                className="mt-0"
                                style={{ paddingTop: '0px' }}
                            >
                                <GridColumn
                                    width={14}
                                    style={{
                                        paddingRight: '0px',
                                        paddingTop: '0px',
                                    }}
                                />
                                <GridColumn
                                    width={2}
                                    style={{
                                        paddingLeft: '0px',
                                        paddingTop: '0px',
                                    }}
                                />
                            </Grid>
                        </GridColumn>
                    </GridRow>
                </Grid>
            </Container>
        );
    }
}

class Page extends Component {
    render() {
        return (
            <div>
                <Helmet>
                    <title>Youtube Room</title>
                    <meta
                        name="description"
                        content="Add songs to the queue and listen to music with friends."
                    />
                </Helmet>
                <Navbar location={this.props.location} />
                <Youtube
                    id={
                        this.props.match.params.id === undefined
                            ? -1
                            : this.props.match.params.id
                    }
                />
            </div>
        );
    }
}
export default Page;
