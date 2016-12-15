/**
 * Created on 11/12/2016.
 */

import {List, Map, fromJS} from 'immutable';

function setState(state, newState) {
    let mergedState = state.merge(newState);
    const oldRound = state.getIn(['vote', 'round']);
    const newRound = fromJS(newState).getIn(['vote', 'round']);
    console.log(oldRound);
    console.log(newRound);
    if( mergedState.get('hasVoted') && oldRound !== newRound ) {
        return mergedState.remove('hasVoted');
    } else {
        return mergedState;
    }
}

function resetVote(state) {
    const hasVoted = state.get('hasVoted');
    const currentPair = state.getIn(['vote', 'pair'], List());
    if(hasVoted && !currentPair.includes(hasVoted)) {
        return state.remove('hasVoted');
    } else {
        return state;
    }
}

function vote(state, entry) {
    const currentPair = state.getIn(['vote', 'pair']);
    if (currentPair && currentPair.includes(entry)) {
        return state.set('hasVoted', entry);
    } else {
        return state;
    }
}

export default function reducer(state = Map(), action) {

    switch (action.type) {
        case 'SET_STATE' :
            return resetVote(setState(state, action.state));
        case 'VOTE' :
            return vote(state, action.entry);
    }

    return state;
}