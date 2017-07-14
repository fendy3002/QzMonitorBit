import context from '../context.js';

var Service = function(module){
    var {io, appConfig} = context;
    var errNsp = io.of('/' + module.filename + '/error');
    var infoNsp = io.of('/' + module.filename + '/info');

    var error = function(actual){
        errNsp.emit('message', actual);
    };
    var flush = function(buffer){
        infoNsp.emit('message', buffer);
    };

    return {
        error,
        flush
    };
};

export default Service;