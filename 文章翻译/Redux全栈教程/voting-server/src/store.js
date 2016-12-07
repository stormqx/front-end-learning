/**
 * Created by qixin on 04/12/2016.
 */

import {createStore} from 'redux';
import reducer from './reducer';

export default function makeStore() {
    return createStore(reducer);
}