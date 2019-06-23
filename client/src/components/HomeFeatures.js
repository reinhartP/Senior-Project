import React, { Component } from 'react';
import { Grid, Segment, Divider } from 'semantic-ui-react';

const SITE_NAME = 'Paghunie';
class Features extends Component {
    render() {
        return (
            <Grid centered columns="equal" style={{ paddingTop: '30px' }}>
                <Grid.Row>
                    <Grid.Column width={5}>
                        <Segment style={{ textAlign: 'left', height: '100%' }}>
                            <h4>
                                Enjoy music in sync with your friends or
                                strangers.
                            </h4>
                            <Divider />
                            <b>{SITE_NAME} features</b>
                            <ul>
                                <li>Synced video player</li>
                                <li>Spotify playlist syncing</li>
                                <li>Queue system for songs</li>
                                <li>Realtime search</li>
                            </ul>
                        </Segment>
                    </Grid.Column>
                    <Grid.Column width={5}>
                        <Segment style={{ textAlign: 'left', height: '100%' }}>
                            <h4>How to use Paghunie</h4>
                            <Divider />
                            <ol>
                                <li>
                                    Join a <a href="/youtube">room</a>
                                </li>
                                <li>
                                    Search for your favorite music and add them
                                    to the queue
                                </li>
                                <Divider />
                                <li>
                                    Optionally create an account to sync your
                                    spotify playlists
                                </li>
                                <li>
                                    Select a song from the playlists tab to add
                                    them to the queue
                                </li>
                            </ol>
                        </Segment>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        );
    }
}

export default Features;
