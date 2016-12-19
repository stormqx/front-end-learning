/**
 * Created by qixin on 01/12/2016.
 */
import {setEntries, next, vote, reset, INITIAL_STATE} from './core'

export default function reducer(state = INITIAL_STATE, action) {
    //figure out which function to call and call it
    switch (action.type) {
        case 'SET_ENTRIES':
            return setEntries(state, action.entries);
        case 'NEXT':
            return next(state);
        case 'VOTE':
            return state.update('vote',
                                 voteState => vote(voteState, action.entry, action.clientId));
        case 'RESET':
            const originalState = reset(state);
            return next(originalState);

    }
    return state;
}