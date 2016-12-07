/**
 * Created by qixin on 01/12/2016.
 */

import {Map, fromJS} from 'immutable';
import {expect} from 'chai';

import reducer from '../src/reducer';

describe('reducer', () => {

    it('handle SET_ENTRIES', () => {
       const initialState = Map();
       const action = {type: 'SET_ENTRIES', entries: ['Transplotting', '28 Days Later']};
       const nextState = reducer(initialState, action);

       expect(nextState).to.equal(fromJS({
           entries: ['Transplotting', '28 Days Later']
       }));
    });

    it('handle NEXT', () => {
        const initialState = fromJS({
            entries: ['Transplotting', '28 Days Later']
        });
        const action = {type: 'NEXT'};
        const nextState = reducer(initialState, action);

        expect(nextState).to.equal(fromJS({
            vote:{
                pair: ['Transplotting', '28 Days Later']
            },
            entries: []
        }));
    });

    it('handle VOTE', () => {
        const initialState = fromJS({
            vote: {
                pair: ['Transplotting', '28 Days Later']
            },
            entries: []
        });
        const action = {type: 'VOTE', entry: 'Transplotting'};
        const nextState = reducer(initialState, action);

        expect(nextState).to.equal(fromJS({
            vote: {
                pair: ['Transplotting', '28 Days Later'],
                tally: {
                    'Transplotting' : 1
                }
            },
            entries: []
        }));
    });

});