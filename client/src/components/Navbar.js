import React, { Component } from 'react';
import axios from 'axios';
import { Menu, Container, Button } from 'semantic-ui-react';
import '../containers/Youtube.css';
import { faAutoprefixer } from '@fortawesome/free-brands-svg-icons';

class NavBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: this.props.user,
            fixed: false,
            activeMenu: this.props.location.pathname,
        };

        this.searchPlaylists = this.searchPlaylists.bind(this);
        this.handleMenuClick = this.handleMenuClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }
    searchPlaylists() {
        console.log(this.props);
        axios
            .get(
                `api/user/playlists?user=${
                    this.state.user === '' ? this.props.user : this.state.user
                }`
            )
            .then(response => {
                this.props.sendDataToParent(response.data);
            });
    }

    handleChange = name => event => {
        this.setState({
            [name]: event.target.value,
        });
    };

    handleMenuClick = (e, { name }) => {
        this.setState({
            activeMenu: name,
        });
    };

    hideFixedMenu = () => this.setState({ fixed: false });
    showFixedMenu = () => this.setState({ fixed: true });
    render() {
        const { pathname } = this.props.location;
        const { activeMenu } = this.state;
        switch (pathname) {
            case '/':
                return (
                    <Menu inverted={true} size="large">
                        <Container fluid={true}>
                            <Menu.Item
                                name="home"
                                active={activeMenu === '/home'}
                                href="/"
                            />
                            <Menu.Item
                                name="youtube"
                                active={activeMenu === '/youtube'}
                                href="/youtube"
                            />

                            <Menu.Menu position="right">
                                <Menu.Item
                                    name="login"
                                    active={activeMenu === '/login'}
                                    href="/login"
                                />
                                <Menu.Item
                                    name="signup"
                                    active={activeMenu === '/signup'}
                                    href="/signup"
                                />
                            </Menu.Menu>
                        </Container>
                    </Menu>
                );
            case '/login':
                return (
                    <Menu inverted={true} size="large">
                        <Container fluid={true}>
                            <Menu.Item
                                name="home"
                                active={activeMenu === '/home'}
                                href="/"
                            />
                            <Menu.Menu position="right">
                                <Menu.Item
                                    name="login"
                                    active={activeMenu === '/login'}
                                    href="/login"
                                />
                                <Menu.Item
                                    name="signup"
                                    active={activeMenu === '/signup'}
                                    href="/signup"
                                />
                            </Menu.Menu>
                        </Container>
                    </Menu>
                );
            case '/signup':
                return (
                    <Menu inverted={true} size="large">
                        <Container fluid={true}>
                            <Menu.Item
                                name="home"
                                active={activeMenu === '/home'}
                                href="/"
                            />
                            <Menu.Menu position="right">
                                <Menu.Item
                                    name="login"
                                    active={activeMenu === '/login'}
                                    href="/login"
                                />
                                <Menu.Item
                                    name="signup"
                                    active={activeMenu === '/signup'}
                                    href="/signup"
                                />
                            </Menu.Menu>
                        </Container>
                    </Menu>
                );
            case '/profile':
                return (
                    <Menu
                        inverted={true}
                        size="large"
                        style={{ borderRadius: '0px' }}
                    >
                        <Container fluid={true}>
                            <Menu.Item
                                name="home"
                                active={activeMenu === '/home'}
                                href="/"
                            />
                            <Menu.Item
                                name="youtube"
                                active={activeMenu === '/youtube'}
                                href="/youtube"
                            />

                            <Menu.Menu position="right">
                                <div
                                    className="ui action input"
                                    style={{
                                        marginTop: 'auto',
                                        marginBottom: 'auto',
                                        paddingRight: '10px',
                                    }}
                                >
                                    <input
                                        type="text"
                                        placeholder="Search a user"
                                        onChange={this.handleChange('user')}
                                    />
                                    <Button
                                        className="inverted green right attached"
                                        type="button"
                                        onClick={this.searchPlaylists}
                                        onMouseDown={e => e.preventDefault()}
                                    >
                                        Search
                                    </Button>
                                </div>
                            </Menu.Menu>
                        </Container>
                    </Menu>
                );
            case '/youtube':
                return (
                    <Menu inverted={true} size="large">
                        <Container fluid={true}>
                            <Menu.Item
                                name="home"
                                active={activeMenu === '/home'}
                                href="/"
                            />
                            <Menu.Item
                                name="youtube"
                                active={activeMenu === '/youtube'}
                                href="/youtube"
                            />
                        </Container>
                    </Menu>
                );
        }
    }
}

export default NavBar;
