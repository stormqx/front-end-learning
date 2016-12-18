/**
 * Created by qixin on 30/11/2016.
 */

import {List, Map, fromJS} from 'immutable';
import {expect} from 'chai';
import {next} from '../src/core';

describe("application logic", () => {

    //..

   describe('winnerAndNext', () => {

       it('put winner of current vote back to entries', () => {
           const state = fromJS({
               vote: {
                   pair: ['Trainspotting', '28 Days Later'],
                   tally: {
                       'Trainspotting': 4,
                       '28 Days Later': 2
                   }
               },
               entries: ['Sunshine', 'Millions', '127 Hours']
           });

           const nextState = next(state);
           expect(nextState).to.equal(fromJS({
               vote: {
                   pair: ['Sunshine', 'Millions'],
                   round: 1
               },
               entries: ['127 Hours', 'Trainspotting']
           }));
       });

       it('puts both from tied vote back to entries', () => {
           const state = Map({
               vote: Map({
                   pair: List.of('Trainspotting', '28 Days Later'),
                   tally: Map({
                       'Trainspotting': 3,
                       '28 Days Later': 3
                   })
               }),
               entries: List.of('Sunshine', 'Millions', '127 Hours')
           });
           const nextState = next(state);
           expect(nextState).to.equal(Map({
               vote: Map({
                   pair: List.of('Sunshine', 'Millions'),
                   round: 1
               }),
               entries: List.of('127 Hours', 'Trainspotting', '28 Days Later')
           }));
       });
   });
});
