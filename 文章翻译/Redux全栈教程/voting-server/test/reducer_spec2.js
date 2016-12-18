/**
 * Created by qixin on 01/12/2016.
 */

import {Map, fromJS} from 'immutable';
import {expect} from 'chai';

import reducer from '../src/reducer';

describe('reducer', () => {

    it('can be used with reduce', () => {
        const actions = [
            {type: 'SET_ENTRIES', entries: ['Trainspotting', '28 Days Later']},
            {type: 'NEXT'},
            {type: 'VOTE', entry: 'Trainspotting', clientId: 'voter1'},
            {type: 'VOTE', entry: '28 Days Later', clientId: 'voter2'},
            {type: 'VOTE', entry: 'Trainspotting', clientId: 'voter3'},
            {type: 'NEXT'}
        ];

        const finalState = actions.reduce(reducer, Map());
        expect(finalState).to.equal(fromJS({
            winner: 'Trainspotting'
        }));
    });
});