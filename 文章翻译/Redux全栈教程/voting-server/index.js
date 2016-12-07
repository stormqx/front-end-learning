/**
 * Created by qixin on 06/12/2016.
 */

import makeStore from './src/store';
import startServer from './src/server';

export const store =  makeStore();
startServer(store);

store.dispatch({
    type: 'SET_ENTRIES',
    entries: require('./entries.json')
});

store.dispatch({
    type: 'NEXT'
});