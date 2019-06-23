import React, { Component } from 'react';
import { Card } from 'semantic-ui-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

class AccountInfo extends Component {
    render() {
        return (
            <Card fluid>
                <Card.Content>
                    <Card.Header>
                        <FontAwesomeIcon icon={faUser} /> Account Information
                    </Card.Header>
                </Card.Content>
                <Card.Content style={{ wordWrap: 'break-word' }}>
                    <strong>id</strong>: {this.props.user.id}
                    <br />
                    <strong>username</strong>: {this.props.user.username}
                    <br />
                    <strong>email</strong>: {this.props.user.email}
                    <br />
                    <strong>password</strong>: {this.props.user.password}
                    <br />
                </Card.Content>
            </Card>
        );
    }
}

export default AccountInfo;
