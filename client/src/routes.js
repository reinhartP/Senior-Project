import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import Home from './containers/Home';
import Signup from './containers/Signup';
import Login from './containers/Login';
import Profile from './containers/Profile';
import Youtube from './containers/Youtube';
import AfterAuth from './containers/AfterAuth';
import Room from './containers/Room';

class Routes extends Component {
    render() {
        return (
            <div>
                <Switch>
                    <Route exact path="/" component={Home} />
                    <Route exact path="/signup" component={Signup} />
                    <Route exact path="/login" component={Login} />
                    <Route exact path="/profile" component={Profile} />
                    <Route path="/youtube/:id" component={Youtube} />
                    <Route exact path="/room" component={Room} />
                    <Route exact path="/api/after-auth" component={AfterAuth} />
                </Switch>
            </div>
        );
    }
}

export default Routes;
