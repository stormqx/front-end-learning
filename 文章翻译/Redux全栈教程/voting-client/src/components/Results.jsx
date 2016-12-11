/**
 * Created on 10/12/2016.
 */

import React from 'react'
import Winner from './Winner';
import {connect} from 'react-redux';

export class Results extends React.PureComponent {
    constructor(props) {
        super(props);
        this.getPair = this.getPair.bind(this);
        this.getVotes = this.getVotes.bind(this);
    }

    getPair() {
        return this.props.pair || [];
    }

    getVotes(entry) {
        if(this.props.tally && this.props.tally.has(entry)) {
            return this.props.tally.get(entry);
        }
        return 0;
    }

    render() {
        return (
            this.props.winner ?
            <Winner ref="winner" winner = {this.props.winner} /> :
            <div className="results">
                {this.getPair().map( (entry, index) =>
                    <div key={index} className="entry">
                        <h1>{entry}</h1>
                        <div className="voteCount">
                            {this.getVotes(entry)}
                        </div>
                    </div>
                )}
                <div className="management">
                    <button ref="next"
                            className="next"
                            onClick={this.props.next}>
                        Next
                    </button>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        pair: state.getIn(['vote', 'pair'],[]),
        tally: state.getIn(['vote', 'tally']),
        winner: state.get('winner')
    }
}

export const ResultsContainer = connect(mapStateToProps)(Results);