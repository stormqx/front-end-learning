/**
 * Created on 12/12/2016.
 */
export default socket => store => next => action => {
    if(action.meta && action.meta.remote) {
        console.log('in middleware', action);
        socket.emit('action', action);
    }
    return next(action);
}
