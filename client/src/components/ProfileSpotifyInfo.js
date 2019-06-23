import React, { Component } from 'react';
import { Card, List, Button, Dimmer, Progress } from 'semantic-ui-react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpotify } from '@fortawesome/free-brands-svg-icons';

class SpotifyInfo extends Component {
    constructor(props) {
        super(props);

        this.state = {
            connected: this.props.spotifyAuth,
            playlists: this.props.playlists,
            isLoading: false,
            active: false,
            progress: 0,
        };
        this.connectSpotify = this.connectSpotify.bind(this);
        this.updatePlaylists = this.updatePlaylists.bind(this);
    }
    async connectSpotify() {
        this.setState({
            isLoading: true,
        });

        let accessString = localStorage.getItem('jwtToken');
        const link = await axios
            .get('api/spotify/authorize', {
                headers: { Authorization: `JWT ${accessString}` },
            })
            .then(response => {
                return response.data.link;
            });

        let newWindow = window.open(link);
        let timer = setInterval(() => {
            if (newWindow.closed) {
                clearInterval(timer);
                axios
                    .get('api/me', {
                        headers: { Authorization: `JWT ${accessString}` },
                    })
                    .then(response => {
                        this.setState({
                            connected: response.data.spotifyAuth,
                            isLoading: false,
                        });
                    });
            }
        }, 1500);
    }

    async updatePlaylists() {
        let accessString = localStorage.getItem('jwtToken');
        await axios
            .get('api/spotify/sync', {
                headers: { Authorization: `JWT ${accessString}` },
            })
            .then(response => {
                this.setState({
                    playlists: response.data,
                });
            });
    }

    async syncPlaylist(playlist) {
        let accessString = localStorage.getItem('jwtToken');
        await axios.post(
            'api/spotify/sync/playlist',
            {
                spotifyPlaylistName: playlist,
            },
            { headers: { Authorization: `JWT ${accessString}` } }
        );
    }

    handleShow = () => this.setState({ active: true });
    handleHide = () => this.setState({ active: false });

    render() {
        if (this.state.connected) {
            return (
                    <Card fluid>
                        <Card.Content>
                            <Card.Header>
                                <FontAwesomeIcon icon={faSpotify} /> Spotify
                            </Card.Header>
                        </Card.Content>
                        <Card.Content>
                            <Button
                                className="green"
                                loading={this.state.isLoading}
                                onClick={this.updatePlaylists}
                            >
                                Update Playlists
                            </Button>
                        </Card.Content>
                        <Card.Content>
                            <List>
                                {this.state.playlists.length > 0 &&
                                    this.state.playlists.map(
                                        (playlist, index) => {
                                            return (
                                                <List.Item
                                                    key={playlist.name + index}
                                                >
                                                    <Button
                                                        onClick={() =>
                                                            this.syncPlaylist(
                                                                playlist.name
                                                            )
                                                        }
                                                    >
                                                        Sync {playlist.name} (
                                                        {playlist.total ||
                                                            playlist.number_of_songs}{' '}
                                                        songs)
                                                    </Button>
                                                    <Progress
                                                        percent={0}
                                                        indicating
                                                    />
                                                </List.Item>
                                            );
                                        }
                                    )}
                            </List>
                        </Card.Content>
                    </Card>
            );
        } else {
            return (
                <Card fluid>
                    <Card.Content>
                        <Card.Header>
                            <FontAwesomeIcon icon={faSpotify} /> Spotify
                        </Card.Header>
                    </Card.Content>
                    <Card.Content>
                        <Button
                            className="green"
                            loading={this.state.isLoading}
                            onClick={this.connectSpotify}
                        >
                            Connect Spotify
                        </Button>
                    </Card.Content>
                </Card>
            );
        }
    }
}

export default SpotifyInfo;
