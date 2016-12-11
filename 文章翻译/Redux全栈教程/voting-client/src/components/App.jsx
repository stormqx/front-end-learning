/**
 * Created on 09/12/2016.
 */

import React from 'react';

export default class App extends React.Component {
    constructor(props) {
        super(props);
    }


    render() {
        return this.props.children;
    }
}