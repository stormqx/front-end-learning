import React from 'react';
import Winner from './Winner';
import Vote from './Vote';
import {List} from 'immutable';
import {connect} from 'react-redux';
import * as actionCreators from '../action_creators';


export class Voting extends React.PureComponent {
    constructor(props) {
        super(props);
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

function mapStateToProps(state) {
    return {
        pair: state.getIn(['vote', 'pair'],List()),
        hasVoted: state.get('hasVoted'),
        winner: state.get('winner')
    }
}

export const VotingContainer = connect(
    mapStateToProps,
    actionCreators
)(Voting);