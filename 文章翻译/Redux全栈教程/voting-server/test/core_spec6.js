/**
 * Created on 18/12/2016.
 */

import expect from 'chai';
import {fromJS} from 'immutable';

describe('application logic', () => {

    describe('handle RESET', () => {

        it('reset state to original state', () => {
            const state = fromJS({
                vote: {
                    pair: ['Trainspotting', '28 Days Later'],
                    tally: {
                        'Trainspotting': 4,
                        '28 Days Later': 2
                    }
                },
                entries: ['Sunshine', 'Millions', '127 Hours'],
                originalEntries: ['Trainspotting', '28 Days Later', 'Sunshine', 'Millions', '127 Hours']
            });

            const action = { type: 'RESET', clientId: '1234'};

            const nextState = fromJS({
                entries: ['Trainspotting', '28 Days Later', 'Sunshine', 'Millions', '127 Hours'],
                originalEntries: ['Trainspotting', '28 Days Later', 'Sunshine', 'Millions', '127 Hours']
            });
        })
    });
});