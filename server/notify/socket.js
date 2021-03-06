import context from '../context.js';

var Service = function(module){
    var {io, appConfig} = context;
    if(!io){ return {
        error: ()=>{},
        flush:()=>{}
    }}
    var errNsp = io.of('/' + module.filename + '/error');
    var infoNsp = io.of('/' + module.filename + '/info');

    var error = function(actual){
        errNsp.emit('message', actual);
    };
    var flush = function(buffer){
        infoNsp.emit('message', buffer);
    };
    var recover = function(buffer){
        infoNsp.emit('message', buffer);
    }

    return {
        error,
        flush,
        recover
    };
};

export default Service;