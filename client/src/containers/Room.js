import React, { Component } from 'react';
import socketIOClient from 'socket.io-client';
import { Button, Form } from 'semantic-ui-react';
import Navbar from '../components/Navbar';

class Room extends Component {
    constructor(props) {
        super(props);

        this.state = {
            socket: '',
            id: '',
            username: '',
        };
    }

    componentDidMount() {
        document.body.style.background = '#202124';
        const socket = socketIOClient('/rooms');
        this.setState({
            socket: socket,
        });

        this.joinRoom = this.joinRoom.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    joinRoom(e) {
        e.preventDefault();
        this.state.socket.emit(
            'new room',
            { id: this.state.id, username: this.state.username },
            data => {}
        );
    }

    handleInputChange = name => event => {
        //user typing
        this.setState({
            [name]: event.target.value,
        });
    };

    render() {
        return (
            <div>
                <Navbar location={this.props.location} />
                <Form>
                    <Form.Field>
                        <label style={{ color: 'white' }}>Room ID</label>
                        <input
                            placeholder="Room ID"
                            onChange={this.handleInputChange('id')}
                        />
                    </Form.Field>
                    <Form.Field>
                        <label style={{ color: 'white' }}>Username</label>
                        <input
                            placeholder="Username"
                            onChange={this.handleInputChange('username')}
                        />
                    </Form.Field>
                    <Button
                        type="Submit"
                        onClick={this.joinRoom}
                        onMouseDown={e => e.preventDefault()}
                    >
                        Submit
                    </Button>
                </Form>
            </div>
        );
    }
}

export default Room;
