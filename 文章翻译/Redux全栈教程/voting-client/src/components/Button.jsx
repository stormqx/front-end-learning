import React from 'react';

export default class Button extends React.PureComponent {
    constructor(props) {
        super(props);
        this.handleVote = this.handleVote.bind(this);
    }

    handleVote() {
        let entry = this.props.entry;
        this.props.vote(entry);
    }


    render() {
        let entry = this.props.entry;
        return (
          <button disabled = {this.props.isDisabled}  onClick={this.handleVote}>
              <h1>{entry}</h1>
              {this.props.hasVotedFor ?
                  <div className="label">voted</div> : null
              }
          </button>
        );
    }
}