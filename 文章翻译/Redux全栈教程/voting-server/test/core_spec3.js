/**
 * Created by qixin on 30/11/2016.
 */

import {List, Map} from 'immutable';
import {expect} from 'chai';
import {vote} from '../src/core';

describe('application logic', () => {

    //..

    describe('vote', () => {

        it('creates a tally for the voted entry', () => {
            const state = Map({
                pair: List.of('Transplotting', '28 Days Later')
            });

            const nextState = vote(state, 'Transplotting');
            expect(nextState).to.equal(Map({
                pair: List.of('Transplotting', '28 Days Later'),
                tally: Map({
                    'Transplotting': 1
                })
            }));
        });

        it('adds to existing tally for the voted entry', () => {
            const state = Map({
                pair: List.of('Transplotting', '28 Days Later'),
                tally: Map({
                    'Transplotting': 3,
                    '28 Days Later': 2
                })
            });

            const nextState = vote(state, 'Transplotting');
            expect(nextState).to.equal(Map({
                pair: List.of('Transplotting', '28 Days Later'),
                tally: Map({
                    'Transplotting': 4,
                    '28 Days Later': 2
                })
            }));
        });

        it('tally won`t be added when voted entry isn`t included in the current pair', () => {
            const state = Map({
                pair: List.of('Transplotting', '28 Days Later'),
                tally: Map({
                    'Transplotting': 3,
                    '28 Days Later': 2
                })
            });

            const nextState = vote(state, 'Sunshine');

            expect(nextState).to.equal(Map({
                pair: List.of('Transplotting', '28 Days Later'),
                tally: Map({
                    'Transplotting': 3,
                    '28 Days Later': 2
                })
            }));
        });

    });
});