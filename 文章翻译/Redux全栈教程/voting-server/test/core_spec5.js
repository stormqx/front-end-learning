/**
 * Created by qixin on 30/11/2016.
 */


import {List, Map, fromJS} from 'immutable';
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

    it('add unique identifier', () => {

        const state = fromJS({
            vote: {
                pair: ['Transplotting', '28 Days Later'],
                round: 1,
                tally: {
                    'Transplotting': 4,
                    '28 Days Later': 2
                }
            },
            entries: ['Sunshine', 'Millions', '127 Hours']
        });

        const nextState = next(state);
        expect(nextState).to.equal(fromJS({
            vote: {
                pair: ['Sunshine', 'Millions'],
                round: 2
            },
            entries: ['127 Hours', 'Transplotting']

        }));

    });

});