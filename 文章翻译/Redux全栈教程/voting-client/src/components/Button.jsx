import React from 'react';

export default class Button extends React.Component {
    constructor(props) {
        super(props);

        //为什么用下面的代码就会报错
        // this.handleVote = this.handleVote.bind(this);
    }

    handleVote() {
        let entry = this.props.entry;
        this.props.vote(entry);
    }

    handleDisabled() {
        return this.props.isDisabled();
    }

    render() {
        let entry = this.props.entry;
        // console.log(entry);
        // console.log(this.props.disabled);
        return (
          <button disabled = {this.handleDisabled.bind(this)}  onClick={this.handleVote.bind(this)}>
              <h1>{entry}</h1>
              {this.props.hasVotedFor ?
                  <div className="label">voted</div> : null
              }
          </button>
        );
    }
}