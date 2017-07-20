import context from '../context.js';

var Service = function(){
    var {io, appConfig} = context;
    if(!io){ return {
        info:()=>{}
    }}
    var nsp = io.of('/monitorbit');

    var info = function(buffer){
        nsp.emit('signal', {
            ...buffer,
            "source" : "MonitorBit"
        });
    };

    nsp.on('connection', function(socket){
        socket.emit('connected', { message: 'connected' });
        socket.on('ping', function(data){
            socket.emit("reply", data);
        });
    });

    return {
        info
    };
};

export default Service;