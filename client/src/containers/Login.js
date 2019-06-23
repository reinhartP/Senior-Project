import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Container, Button, Form } from 'semantic-ui-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

import Navbar from '../components/Navbar';

class Login extends Component {
    constructor(props) {
        super(props);

        this.state = {
            username: '',
            password: '',
            showError: false,
            loggedIn: false,
        };

        this.loginUser = this.loginUser.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange = name => event => {
        this.setState({
            [name]: event.target.value,
        });
    };

    loginUser(e) {
        e.preventDefault();

        axios
            .post('login', {
                username: this.state.username,
                password: this.state.password,
            })
            .then(response => {
                if (
                    response.data === 'bad username' ||
                    response.data === 'passwords do not match'
                ) {
                    this.setState({ showError: true });
                } else {
                    localStorage.setItem('jwtToken', response.data.token);
                    this.setState({
                        loggedIn: true,
                        showError: false,
                    });
                }
            })
            .catch(error => {
                console.log(error.data);
            });
    }

    render() {
        const { showError, loggedIn } = this.state;

        if (!loggedIn) {
            return (
                <div>
                    <Navbar location={this.props.location} />
                    <Container
                        style={{ paddingTop: '30px', textAlign: 'left' }}
                    >
                        <h1>
                            <FontAwesomeIcon icon={faSignInAlt} /> Login
                        </h1>
                        <Form onSubmit={this.loginUser}>
                            <Form.Field>
                                <label style={{ color: 'white' }}>
                                    Username
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter username"
                                    onChange={this.handleChange('username')}
                                />
                            </Form.Field>
                            <Form.Field>
                                <label style={{ color: 'white' }}>
                                    Password
                                </label>
                                <input
                                    type="password"
                                    placeholder="Password"
                                    onChange={this.handleChange('password')}
                                />
                            </Form.Field>
                            <Button color="yellow" type="submit">
                                Submit
                            </Button>
                        </Form>
                        {showError && <p>Incorrect email or password.</p>}
                    </Container>
                </div>
            );
        } else {
            return <Redirect to="/profile" />;
        }
    }
}

export default Login;
