/**
 * Created by qixin on 07/12/2016.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import Voting from './components/Voting';
import Results from './components/Results';
import Winner from './components/Winner';
import {Router, Route, browserHistory, IndexRoute} from 'react-router';


const appInstance = (<Router history={browserHistory}>
                        <Route  component={App}>
                            <Route path="/" component={Voting}/>
                            <Route path="/results" component={Results}/>
                        </Route>
                      </Router>);

ReactDOM.render(
    appInstance,
    document.getElementById('app')
);