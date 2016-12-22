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
        meta: {remote: true},
        type: 'VOTE',
        entry
    };
}

export function next() {
    return {
        meta: {remote: true},
        type: 'NEXT'
    };
}

export function setClientId(clientId) {
    return {
        type: 'SET_CLIENT_ID',
        clientId
    };
}

export function reset() {
    return {
        meta: {remote: true},
        type: 'RESET'
    };
}

export function setConnectionState(state, connected) {
    return {
        type: 'SET_CONNECTION_STATE',
        state,
        connected
    };
}