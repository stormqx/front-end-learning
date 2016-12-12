/**
 * Created on 12/12/2016.
 */

export function setState(state) {
    return {
        type: 'SET_STATE',
        state
    };
}

export function vote(entry) {
    return {
        type: 'VOTE',
        entry
    };
}