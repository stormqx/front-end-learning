/**
 * Created on 11/12/2016.
 */

import {Map} from 'immutable';

function setState(state, newState) {
    return state.merge(newState);
}

export default function reducer(state = Map(), action) {

    switch (action.type) {
        case 'SET_STATE' :
            return setState(state, action.state);
    }

    return state;
}