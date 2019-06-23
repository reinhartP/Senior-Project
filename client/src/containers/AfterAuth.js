import React, { Component } from 'react'


class AfterAuth extends Component {

    componentDidMount() {
        window.opener.focus();
        window.close()
    }
    render() {
        return (
            <div>
               
            </div>
        )
    }
}

export default AfterAuth
