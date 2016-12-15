/**
 * Created by qixin on 30/11/2016.
 */

import {List, Map} from 'immutable';
import {expect} from 'chai';
import { next, mapTest1} from '../src/core';


describe('application logic', () => {

    //..

    describe('next', () => {

        it('take the next two entries under vote', () => {
            const state = Map({
                entries: List.of('Transpotting', '28 Days Later', 'Sunshine')
            });
            const nextState = next(state);
            expect(nextState).to.equal(Map({
                vote: Map({
                    pair: List.of('Transpotting', '28 Days Later'),
                    round: 1
                }),
                entries: List.of('Sunshine')
            }));
        });

    });

});