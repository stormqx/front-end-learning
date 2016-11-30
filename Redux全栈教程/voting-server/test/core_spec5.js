/**
 * Created by qixin on 30/11/2016.
 */


import {List, Map} from 'immutable';
import {expect} from 'chai';
import {next} from '../src/core';

describe('next', () => {

    // ...

    it('marks winner when just one entry left', () => {
        const state = Map({
            vote: Map({
                pair: List.of('Trainspotting', '28 Days Later'),
                tally: Map({
                    'Trainspotting': 4,
                    '28 Days Later': 2
                })
            }),
            entries: List()
        });
        const nextState = next(state);
        expect(nextState).to.equal(Map({
            winner: 'Trainspotting'
        }));
    });

});