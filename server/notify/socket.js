import context from '../context.js';

var Service = function(module){
    var {io, appConfig} = context;
    var error = function(actual){
        
    };
    var flush = function(buffer){
        
    };

    return {
        error,
        flush
    };
};

export default Service;