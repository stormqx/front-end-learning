/**
 * Created by qixin on 27/11/2016.
 */

import {expect} from 'chai';
import {List} from 'immutable';

describe('immutability', () => {

    //..

    describe('A list', () => {

        function addMovie(currentState, movie) {
            return currentState.push(movie);
        }

        it('is immutable', () => {
            let state = List.of('Trainspotting', '28 Days Later');
            let nextState = addMovie(state, 'Sunshine');

            expect(nextState).to.equal(List.of(
                'Trainspotting',
                '28 Days Later',
                'Sunshine'
            ));
            expect(state).to.equal(List.of(
                'Trainspotting',
                '28 Days Later'
            ));
        });

    });


});