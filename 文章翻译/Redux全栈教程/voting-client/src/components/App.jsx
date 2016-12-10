/**
 * Created on 09/12/2016.
 */

import React from 'react';
import {List, Map} from 'immutable';

const pair = List.of('Trainspotting', '28 Days Later');
const tally = Map({'Trainspotting': 4, '28 Days Later': 2});

export default class App extends React.Component {
    constructor(props) {
        super(props);
    }


    render() {
        return React.cloneElement(this.props.children, {pair: pair, tally: tally});
    }
}