import lo from 'lodash';

var Service = () => {
    var handlers = [];
    var subscribe = function(callback){
        var handler = {
            safe: false,
            callback: callback
        };
        handlers.push(handler);
    };
    var shutdown = function(onClear){
        lo.forEach(handlers, (handler, ix) => {
            handler.callback(() => {
                handler.safe = true;
                if(canDown()){
                    onClear();
                }
            });
        });
    };
    var canDown = function(){
        var result = true;
        lo.forEach(handlers, handler => {
            result = result & handler.safe;
        });
        return result;
    };
    return {
        subscribe,
        shutdown
    };
};

export default Service;