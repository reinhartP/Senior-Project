import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { Container, Button, Form } from 'semantic-ui-react'
import axios from 'axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons'

import Navbar from '../components/Navbar'

class Signup extends Component {
    constructor(props) {
        super(props)

        this.state = {
            username: '',
            email: '',
            password: '',
            messageFromServer: '',
            showError: false,
            registerError: false,
            emailError: false,
            usernameError: false,
        }
        this.handleChange = this.handleChange.bind(this)
        this.registerUser = this.registerUser.bind(this)
    }

    handleChange = name => event => {
        this.setState({
            [name]: event.target.value,
        })
    }

    registerUser(e) {
        e.preventDefault()
        axios
            .post('signup', {
                username: this.state.username,
                email: this.state.email,
                password: this.state.password,
            })
            .then(response => {
                console.log('response', response)
                if (response.data === 'email is already taken') {
                    this.setState({
                        showError: true,
                        emailError: true,
                        usernameError: false,
                        registerError: false,
                    })
                } else if (response.data === 'username is already taken') {
                    this.setState({
                        showError: true,
                        emailError: false,
                        usernameError: true,
                        registerError: false,
                    })
                } else if (
                    response.data === 'email and password required' ||
                    response.data === 'Missing credentials'
                ) {
                    this.setState({
                        showError: true,
                        emailError: false,
                        usernameError: false,
                        registerError: true,
                    })
                } else {
                    this.setState({
                        messageFromServer: response.data.message,
                        showError: false,
                        emailError: false,
                        usernameError: false,
                        registerError: false,
                    })
                }
            })
            .catch(err => console.log(err.data))
    }

    render() {
        const {
            messageFromServer,
            showError,
            registerError,
            emailError,
            usernameError,
        } = this.state

        if (messageFromServer === '') {
            return (
                <div>
                    <Navbar location={this.props.location}/>
                    <Container
                    className="justify-content-center"
                    style={{ paddingTop: '30px', textAlign: 'left' }}
                    >
                        <h1>
                            <FontAwesomeIcon icon={faSignInAlt} /> Signup
                        </h1>
                        <Form onSubmit={this.registerUser}>
                            <Form.Field>
                                <input
                                    type="email"
                                    placeholder="Enter email"
                                    onChange={this.handleChange('email')}
                                />
                            </Form.Field>
                            <Form.Field>
                                <input
                                    type="text"
                                    placeholder="Enter username"
                                    onChange={this.handleChange('username')}
                                />
                            </Form.Field>
                            <Form.Field>
                                <input
                                    type="password"
                                    placeholder="Password"
                                    onChange={this.handleChange('password')}
                                />
                            </Form.Field>
                            <Button color='yellow' type="submit">
                                Submit
                            </Button>
                        </Form>
                        {showError === true && registerError === true && (
                            <div>
                                <p>
                                    Email, username, and password are required
                                    fields.
                                </p>
                            </div>
                        )}
                        {showError === true && emailError === true && (
                            <div>
                                <p>
                                    That email is already taken. Please choose
                                    another for login.
                                </p>
                            </div>
                        )}
                        {showError === true && usernameError === true && (
                            <div>
                                <p>
                                    That username is already taken. Please
                                    choose another for login.
                                </p>
                            </div>
                        )}
                </Container>
                </div>
                
            )
        } else if (messageFromServer === 'user created') {
            return (
                <div>
                    <h3>User successfully registered!</h3>
                    <Button style={{ margin: '1em' }}>
                        <Link
                            style={{ textDecoration: 'none', color: 'white' }}
                            to="/login"
                        >
                            Login
                        </Link>
                    </Button>
                </div>
            )
        }
    }
}

export default Signup
