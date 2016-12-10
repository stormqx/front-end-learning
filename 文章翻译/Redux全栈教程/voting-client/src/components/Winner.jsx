/**
 * Created on 09/12/2016.
 */

import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';



export default class Winner extends React.Component {
    constructor(props) {
        super(props);
        this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    }


    render() {
        return (
            <div className="Winner">
               Winner is {this.props.winner}
            </div>
        );
    }
}