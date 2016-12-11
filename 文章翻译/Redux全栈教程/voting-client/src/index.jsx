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
import {Router, Route, browserHistory, IndexRoute} from 'react-router';


const store = createStore(reducer);

store.dispatch({
    type: 'SET_STATE',
    state: {
        vote: {
            pair: ['Trainspotting', '28 Days Later'],
            tally: {'Trainspotting': 2}
        }
    }
});

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