import React from 'react';
import Winner from './Winner';
import Vote from './Vote';
import PureRenderMixin from 'react-addons-pure-render-mixin';


export default class Voting extends React.Component {
    constructor(props) {
        super(props);
        this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    }


    render() {
        return (
            <div className="voting">
                {this.props.winner ?
                    <Winner ref="winner" winner={this.props.winner}/> :
                    <Vote {...this.props}/>
                }
            </div>
        );
    }
}