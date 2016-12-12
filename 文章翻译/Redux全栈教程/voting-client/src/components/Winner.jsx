/**
 * Created on 09/12/2016.
 */

import React from 'react';



export default class Winner extends React.PureComponent {
    constructor(props) {
        super(props);
    }


    render() {
        return (
            <div className="Winner">
               Winner is {this.props.winner}
            </div>
        );
    }
}