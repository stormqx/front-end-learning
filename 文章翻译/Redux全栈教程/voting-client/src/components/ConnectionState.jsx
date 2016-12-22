/**
 * Created on 22/12/2016.
 */

import React from 'react';
import {connect} from 'react-redux';
import {Map} from 'immutable';

export default class ConnectionState extends React.PureComponent {
    constructor(props) {
        super(props);
        this.isVisible = this.isVisible.bind(this);
        this.getMessage = this.getMessage.bind(this);
    }

    isVisible() {
        return !this.props.connected;
    }

    getMessage() {
        return `Not connected (${this.props.state})`;
    }


    render() {
        return (
            <div className = "connectionState"
                 style={{display: this.isVisible() ? 'block' : 'none'}}>
                {this.getMessage()}
            </div>
        );
    }
}

export const ConnectionStateContainer = connect(
    state => state.get('connection',Map()).toJS()
)(ConnectionState);