/**
 * Created on 17/12/2016.
 */

import uuid from 'uuid';

export default function getClientId() {
    let id = localStorge.getItem('clientId');
    if(!id) {
        id = uuid.v4();
        localStorge.setItem('clientId', id);
    }
    return id;
}