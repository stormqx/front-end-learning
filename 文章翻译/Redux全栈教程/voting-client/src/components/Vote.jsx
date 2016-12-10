/**
 * Created on 09/12/2016.
 */

import React from 'react';
import Button from './Button';
import PureRenderMixin from 'react-addons-pure-render-mixin';


export default class Vote extends React.Component {
    constructor(props) {
        super(props);
        this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    }

    getPair() {
        return this.props.pair;
    }

    isDisabled() {
        return !!this.props.hasVoted;
    }

    vote(entry) {
        //投票方法
        console.log(entry);
    }

    hasVotedFor(entry) {
        return this.props.hasVoted === entry;
    }

    render() {
        return (
            <div className="vote">
                {this.getPair().map((entry, index) =>
                    <Button
                        key={index}
                        entry={entry}
                        vote={this.vote.bind(this)}
                        hasVotedFor={this.hasVotedFor(entry)}
                        isDisabled={this.isDisabled.bind(this)}>
                    </Button>)
                }
            </div>
        );
    }
}