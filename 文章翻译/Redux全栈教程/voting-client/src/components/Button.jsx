import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';


export default class Button extends React.Component {
    constructor(props) {
        super(props);
        this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);

        this.handleVote = this.handleVote.bind(this);
        this.handleDisabled = this.handleDisabled.bind(this);
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
        //console.log(this.handleDisabled());
        return (
          <button disabled = {this.handleDisabled()}  onClick={this.handleVote}>
              <h1>{entry}</h1>
              {this.props.hasVotedFor ?
                  <div className="label">voted</div> : null
              }
          </button>
        );
    }
}