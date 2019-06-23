import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { Container, Grid } from 'semantic-ui-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMusic } from '@fortawesome/free-solid-svg-icons';

import Navbar from '../components/Navbar';
import Features from '../components/HomeFeatures';
class Home extends Component {
    componentDidMount() {
        document.body.style.background = '#202124';
    }
    render() {
        return (
            <div>
                <Helmet>
                    <title>Paghunie Music Site</title>
                    <meta
                        name="description"
                        content="Welcome to Paghunie music site where you can listen to music in realtime with friends."
                    />
                </Helmet>
                <Navbar location={this.props.location} />
                <Container
                    fluid={true}
                    textAlign="center"
                    style={{ minHeight: 700, paddingTop: '0px' }}
                >
                    <Container text style={{ paddingTop: '80px' }}>
                        <h1 style={{ color: 'white' }}>
                            <FontAwesomeIcon icon={faMusic} /> Paghunie Music
                            Site
                        </h1>
                        <h3 style={{ color: 'white' }}>
                            Listen to music with friends
                        </h3>
                        <h5 style={{ color: 'white' }}>
                            Site features realtime search and queue system for
                            videos
                        </h5>
                    </Container>
                    <Features />
                    <footer
                        style={{
                            position: 'absolute',
                            bottom: '0',
                            width: '100%',
                            height: '5rem',
                            color: 'white',
                        }}
                    >
                        <Grid
                            centered
                            divided
                            inverted
                            columns="equal"
                            style={{ height: '100%' }}
                        >
                            <Grid.Column width={4}>
                                <h5>
                                    Paghunie is a music site where you can enjoy
                                    music with friends or strangers. The site
                                    includes a realtime search and queue system
                                    for videos.
                                </h5>
                            </Grid.Column>

                            <Grid.Column width={4}>
                                <h5>
                                    Created with MySQL, Express, React, and
                                    Nodejs
                                </h5>
                            </Grid.Column>
                        </Grid>
                    </footer>
                </Container>
            </div>
        );
    }
}

export default Home;
