/**
 * Created on 11/12/2016.
 */

import {List, Map, fromJS} from 'immutable';
import {expect} from 'chai';
import reducer from '../src/reducer';

describe('reducer', () => {

    it('handles SET_STATE', () => {
        const initialState = Map();
        const action = {
            type: 'SET_STATE',
            state: Map({
                vote: Map({
                    pair: List.of('Trainspotting', '28 Days Later'),
                    tally: Map({Trainspotting: 1})
                })
            })
        };
        const nextState = reducer(initialState, action);

        expect(nextState).to.equal(fromJS({
            vote: {
                pair: ['Trainspotting', '28 Days Later'],
                tally: {Trainspotting: 1}
            }
        }));
    });

    it('handles SET_STATE with plain JS payload', () => {
        const initialState = Map();
        const action = {
            type: 'SET_STATE',
            state: {
                vote: {
                    pair: ['Trainspotting', '28 Days Later'],
                    tally: {Trainspotting: 1}
                }
            }
        };
        const nextState = reducer(initialState, action);

        expect(nextState).to.equal(fromJS({
            vote: {
                pair: ['Trainspotting', '28 Days Later'],
                tally: {Trainspotting: 1}
            }
        }));
    });

    it('handles SET_STATE without initial state', () => {
        const action = {
            type: 'SET_STATE',
            state: {
                vote: {
                    pair: ['Trainspotting', '28 Days Later'],
                    tally: {Trainspotting: 1}
                }
            }
        };
        const nextState = reducer(undefined, action);

        expect(nextState).to.equal(fromJS({
            vote: {
                pair: ['Trainspotting', '28 Days Later'],
                tally: {Trainspotting: 1}
            }
        }));
    });

    it('handle VOTE by setting hasVoted', () => {
        const state =  fromJS({
            vote: {
                pair: ['Trainspotting', 'Sunshine'],
                tally: {'Trainspotting': 4}
            }
        });

        const action = {type: 'VOTE', entry: 'Sunshine'};

        const nextState = reducer(state, action);
        expect(nextState).to.equal(fromJS({
            vote: {
                pair: ['Trainspotting', 'Sunshine'],
                tally: {'Trainspotting': 4}
            },
            hasVoted: 'Sunshine'
        }));
    });

    it('does not setting hasVoted for VOTE on invalid entry', () => {
        const state =  fromJS({
            vote: {
                pair: ['Trainspotting', 'Sunshine'],
                tally: {'Trainspotting': 4}
            }
        });

        const action = {type: 'VOTE', entry: '28 Days Later'};

        const nextState = reducer(state, action);
        expect(nextState).to.equal(fromJS({
            vote: {
                pair: ['Trainspotting', 'Sunshine'],
                tally: {'Trainspotting': 4}
            }
        }));
    });

    it('removes hasVoted on SET_STATE if pair changes', () => {
        const initialState = fromJS({
            vote: {
                pair: ['Trainspotting', '28 Days Later'],
                tally: {Trainspotting: 1}
            },
            hasVoted: 'Trainspotting'
        });
        const action = {
            type: 'SET_STATE',
            state: {
                vote: {
                    pair: ['Sunshine', 'Slumdog Millionaire']
                }
            }
        };
        const nextState = reducer(initialState, action);

        expect(nextState).to.equal(fromJS({
            vote: {
                pair: ['Sunshine', 'Slumdog Millionaire']
            }
        }));
    });

});