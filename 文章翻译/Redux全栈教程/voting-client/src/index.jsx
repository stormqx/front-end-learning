/**
 * Created by qixin on 07/12/2016.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import {VotingContainer} from './components/Voting';
import {ResultsContainer} from './components/Results';
import {createStore, applyMiddleware} from 'redux';
import {Provider} from 'react-redux';
import reducer from './reducer';
import {Router, Route, browserHistory} from 'react-router';
import io from 'socket.io-client';
import {setState, setClientId, setConnectionState} from './action_creators';
import getClientId from './client_id';
import remoteActionMiddleware from './remote_action_middleware';





const socket = io(`${location.protocol}//${location.hostname}:8090`);
socket.on('state', state =>
    store.dispatch(setState(state))
);

[
    'connect',
    'connect_error',
    'connect_timeout',
    'reconnect',
    'reconnect_error',
    'reconnect_failed'
].forEach( ev =>
  socket.on(ev, () => store.dispatch(setConnectionState(ev, socket.connected)))
);

const createStoreWithMiddleware = applyMiddleware(
    remoteActionMiddleware(socket)
)(createStore);
const store = createStoreWithMiddleware(reducer);
store.dispatch(setClientId(getClientId()));



const appInstance = (
    <Provider store={store}>
      <Router history={browserHistory}>
        <Route  component={App}>
            <Route path="/" component={VotingContainer}/>
            <Route path="/results" component={ResultsContainer}/>
        </Route>
      </Router>
    </Provider>
    );

ReactDOM.render(
    appInstance,
    document.getElementById('app')
);