import context from '../context.js';

var Service = function(){
    var {io, appConfig} = context;
    if(!io){ return {
        info:()=>{}
    }}
    var nsp = io.of('/monitorbit');

    var info = function(buffer){
        nsp.emit('message', buffer);
    };

    return {
        info
    };
};

export default Service;