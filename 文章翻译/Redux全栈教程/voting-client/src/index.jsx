/**
 * Created by qixin on 07/12/2016.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import {VotingContainer} from './components/Voting';
import {ResultsContainer} from './components/Results';
import {createStore} from 'redux';
import {Provider} from 'react-redux';
import reducer from './reducer';
import {Router, Route, browserHistory} from 'react-router';
import io from 'socket.io-client';


const store = createStore(reducer);

const socket = io(`${location.protocol}//${location.hostname}:8090`);
socket.on('state', state =>
    store.dispatch({type: 'SET_STATE', state})
);

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