/**
 * Created by qixin on 01/12/2016.
 */
import {fromJS} from 'immutable';
import {expect} from 'chai';

import reducer from '../src/reducer';

describe('reducer', () => {

    //..

    it('initial a undefined state', () => {
        const action = {type: 'SET_ENTRIES', entries: ['Transplotting']};
        const nextState = reducer(undefined, action);

        expect(nextState).to.equal(fromJS({
            entries: ['Transplotting']
        }));
    });
});