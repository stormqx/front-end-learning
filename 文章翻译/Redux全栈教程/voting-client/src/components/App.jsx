/**
 * Created on 09/12/2016.
 */

import React from 'react';
import {ConnectionStateContainer}  from './ConnectionState';

export default class App extends React.Component {
    constructor(props) {
        super(props);
    }


    render() {
        return (
            <div>
                <ConnectionStateContainer />
                {this.props.children}
            </div>
        )

    }
}