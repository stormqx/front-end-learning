/**
 * Created by qixin on 27/11/2016.
 */
import {List, Map} from 'immutable';


export const INITIAL_STATE = Map();


export function setEntries(state, entries) {
    return state.set('entries', List(entries));
}

export function next(state) {
    const entries = state.get('entries')
        .concat(getWinners(state.get('vote')));
    if (entries.size === 1) {
        return state.remove('vote')
            .remove('entries')
            .set('winner', entries.first());
    } else {
        return state.merge({
            vote: Map(
                {pair: entries.take(2),
                 round: state.getIn(['vote', 'round'], 0) + 1
                }),
            entries: entries.skip(2)
        });
    }
}

function addVote(voteState, entry, voter) {
    const currentPair = voteState.get('pair', List());
    if(currentPair.includes(entry) && voter ) {
        return voteState.updateIn(['tally', entry], 0, tally => tally+1)
                        .setIn(['voters', voter], entry)
    }
    return voteState;
}

function removePreviousVote(voteState, voter) {
    const previousVote = voteState.getIn(['voters', voter]);
    if(previousVote) {
        return voteState.updateIn(['tally', previousVote], tally => tally-1)
                        .removeIn(['voters',voter]);
    }
    return voteState;
}

export function vote(voteState, entry, voter) {
    return addVote(
        removePreviousVote(voteState, voter),
        entry,
        voter
    )
}

function getWinners(vote) {
    if (!vote) return [];
    const [a, b] = vote.get('pair');
    const aVotes = vote.getIn(['tally', a], 0);
    const bVotes = vote.getIn(['tally', b], 0);
    if      (aVotes > bVotes)  return [a];
    else if (aVotes < bVotes)  return [b];
    else                       return [a, b];
}