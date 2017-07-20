var Service = function(escalation){
    var context = {
        times: 0,
        lastExecute: null,
        executing: false
    };

    var execRetry = (callback) => {
        var isStopping = false;
        var nextHandler = null;
        var done = () => {
            context.times++;
            var delay = (escalation[context.times] || escalation.after) * 1000;
            nextHandler = setTimeout(function() {
                if(!isStopping){
                    callback(done, stop);
                }
            }, delay);
        };
        var stop = () => {
            context.times = 0;
            isStopping = true;
            clearTimeout(nextHandler);
        };
        callback(done, stop);
    };

    var exec = (callback) => {
        if(executing){ return; }
        executing = true;

        if(context.times > 0){
            var currentDate = new Date();
            var escalationTimeInSec = escalation[context.times] || escalation.after;
            var escalationTime = escalationTimeInSec * 1000;
            
            var diffTime = currentDate.getTime() - context.lastExecute.getTime();
            if(diffTime < escalationTime){
                executing = false;
                return;
            }
            else{
                setImmediate(()=> {
                    callback(() => {
                        context.lastExecute = new Date();
                        context.times++;
                        executing = false;
                    });
                });
            }
        }
        else{
            setImmediate(()=> {
                callback(() => {
                    context.lastExecute = new Date();
                    context.times++;
                    executing = false;
                });
            });
        }
    };
    var reset = () => {
        context.times = 0;
        context.lastExecute = null;
    };
    var times = () => context.times;
    return {
        execRetry,
        times,
        exec,
        reset
    };
};
export default Service;