/**
 * Created on 09/12/2016.
 */

import React from 'react';
import Button from './Button';
import {Seq} from 'immutable';

export default class Vote extends React.PureComponent {
    constructor(props) {
        super(props);
        this.isDisabled = this.isDisabled.bind(this);
        this.hasVotedFor = this.hasVotedFor.bind(this);
    }

    getPair() {
        return Seq(this.props.pair);
    }

    isDisabled() {
        return !!this.props.hasVoted;
    }

    hasVotedFor(entry) {
        return this.props.hasVoted === entry;
    }

    render() {
        return (
            <div className="vote">
                {this.getPair().map((entry,index) =>
                    <Button
                        key={index}
                        entry={entry}
                        vote={this.props.vote}
                        hasVotedFor={this.hasVotedFor(entry)}
                        isDisabled={this.isDisabled()}>
                    </Button>)
                }
            </div>
        );
    }
}