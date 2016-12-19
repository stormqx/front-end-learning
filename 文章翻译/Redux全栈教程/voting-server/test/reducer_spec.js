/**
 * Created by qixin on 01/12/2016.
 */

import {List, Map, fromJS} from 'immutable';
import {expect} from 'chai';

import reducer from '../src/reducer';

describe('reducer', () => {

    it('handle SET_ENTRIES', () => {
       const initialState = Map();
       const action = {type: 'SET_ENTRIES', entries: ['Trainspotting', '28 Days Later']};
       const nextState = reducer(initialState, action);

       expect(nextState).to.equal(fromJS({
           entries: ['Trainspotting', '28 Days Later'],
           originalEntries: ['Trainspotting', '28 Days Later']
       }));
    });

    it('handle NEXT', () => {
        const initialState = fromJS({
            entries: ['Trainspotting', '28 Days Later'],

        });
        const action = {type: 'NEXT'};
        const nextState = reducer(initialState, action);

        expect(nextState).to.equal(fromJS({
            vote:{
                pair: ['Trainspotting', '28 Days Later'],
                round: 1
            },
            entries: []
        }));
    });

    //修改vote unit test,无voter的vote操作视为无效操作
    it('handle VOTE', () => {
        const initialState = fromJS({
            vote: {
                pair: ['Trainspotting', '28 Days Later']
            },
            entries: []
        });
        const action = {type: 'VOTE', entry: 'Trainspotting'};
        const nextState = reducer(initialState, action);

        expect(nextState).to.equal(fromJS({
            vote: {
                pair: ['Trainspotting', '28 Days Later'],
            },
            entries: []
        }));
    });

    it('handle VOTE with voter', () => {
       const initialState = fromJS({
           vote:{
               pair: ['Trainspotting', '28 Days Later']
           }
       });

       const action = {type: 'VOTE', entry: 'Trainspotting', clientId: '1234'};
       const nextState = reducer(initialState, action);
       expect(nextState).to.equal(fromJS({
           vote:{
               pair: ['Trainspotting', '28 Days Later'],
               tally: {
                   'Trainspotting': 1
               },
               voters: {
                   '1234': 'Trainspotting'
               }
           }
       }));
    });

});