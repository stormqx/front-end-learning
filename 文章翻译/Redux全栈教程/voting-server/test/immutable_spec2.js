/**
 * Created by qixin on 27/11/2016.
 */
import {expect} from 'chai';
import {List, Map} from 'immutable';

describe('immutability', () => {

    //..

    describe('a tree', () => {

        function addMovie(currentState, movie) {
            return currentState.set(
                'movies',
                currentState.get('movies').push(movie)
            );
        }

        it('is immutable', ()=> {
           let state = Map({
              movies: List.of(
                  'Trainspotting',
                  '28 Days Later'
              )
           });
           let nextState = addMovie(state, 'Sunshine');

           expect(nextState).to.equal(Map({
               movies: List.of(
                   'Trainspotting',
                   '28 Days Later',
                   'Sunshine'
               )
           }));
           expect(state).to.equal(Map({
               movies: List.of(
                   'Trainspotting',
                   '28 Days Later'
               )
           }));
        });

    });

});