import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';
import {
    Container,
    Grid,
    GridColumn,
    GridRow,
    Button,
    Divider,
} from 'semantic-ui-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAnchor } from '@fortawesome/free-solid-svg-icons';

import Navbar from '../components/Navbar';
import ProfilePlaylistInfo from '../components/ProfilePlaylistInfo';
import ProfileSpotifyInfo from '../components/ProfileSpotifyInfo';
import ProfileAccountInfo from '../components/ProfileAccountInfo';

class ProfileInfo extends Component {
    constructor(props) {
        super(props);
        this.logout = this.logout.bind(this);
    }

    logout(e) {
        this.setState({ auth: false });
        localStorage.removeItem('jwtToken');
    }
    render() {
        const {
            id,
            username,
            email,
            password,
            auth,
            spotifyAuth,
            error,
            isLoading,
        } = this.props.state;
        if (isLoading) {
            return <div>Loading...</div>;
        } else if (!error && auth) {
            return (
                <Container
                    fluid={true}
                    style={{
                        paddingTop: '20px',
                        textAlign: 'left',
                        maxWidth: '1400px',
                    }}
                >
                    <Grid centered style={{ paddingBottom: '1rem' }}>
                        <GridRow style={{ paddingBottom: '0.5rem' }}>
                            <h1>
                                <FontAwesomeIcon icon={faAnchor} /> Profile Page
                            </h1>
                        </GridRow>
                        <Button
                            className="inverted red small"
                            onClick={this.logout}
                            href="/"
                        >
                            Logout
                        </Button>
                    </Grid>
                    <Divider />
                    <Grid centered columns="equal">
                        <GridColumn width={5} className="ml-auto">
                            <GridRow style={{ paddingBottom: '20px' }}>
                                <ProfileAccountInfo
                                    user={{
                                        id: id,
                                        username: username,
                                        email: email,
                                        password: password,
                                    }}
                                />
                            </GridRow>

                            <GridRow>
                                <ProfilePlaylistInfo
                                    playlists={this.props.state.searchPlaylists}
                                />
                            </GridRow>
                        </GridColumn>
                        <GridColumn width={5} className="mr-auto">
                            <ProfileSpotifyInfo
                                spotifyAuth={spotifyAuth}
                                playlists={this.props.state.syncPlaylists}
                            />
                        </GridColumn>
                    </Grid>
                </Container>
            );
        } else if (!auth) {
            return <Redirect to="/" />;
        }
    }
}

class Profile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: '',
            username: '',
            email: '',
            password: '',
            syncPlaylists: [],
            searchPlaylists: [],
            auth: false,
            spotifyAuth: false,
            isLoading: true,
            error: false,
        };
        this.handleSearch = this.handleSearch.bind(this);
    }

    async componentDidMount() {
        let accessString = localStorage.getItem('jwtToken');
        if (accessString === null) {
            this.setState({
                isLoading: false,
                error: true,
            });
        }
        await axios
            .get('api/me', {
                headers: { Authorization: `JWT ${accessString}` },
            })
            .then(response => {
                this.setState({
                    id: response.data.id,
                    username: response.data.username,
                    email: response.data.email,
                    password: response.data.password,
                    syncPlaylists: response.data.syncPlaylists,
                    auth: response.data.auth,
                    spotifyAuth: response.data.spotifyAuth,
                    isLoading: false,
                    error: false,
                });
            });
    }

    handleSearch = searchPlaylists => {
        this.setState({
            searchPlaylists,
        });
    };

    render() {
        return (
            <div>
                <Navbar
                    location={this.props.location}
                    user={this.state.username}
                    sendDataToParent={this.handleSearch}
                    
                />
                <ProfileInfo state={this.state} />
            </div>
        );
    }
}

export default Profile;
