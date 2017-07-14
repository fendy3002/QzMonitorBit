import email from './email.js';
var Service = function(module){
    var notifiers = [];
    if(module.notify){
        if(module.notify.email){
            notifiers = notifiers.concat(
                lo.map(module.notify.email, k=> {
                    return email(module, k);
                }));
        }
    }

    var error = function(actual){
        lo.forEach(notifiers, n=> {
            n.error(actual);
        });
    };
    var flush = function(buffer){
        lo.forEach(notifiers, n=> {
            n.flush(buffer);
        });
    };
};

export default Serivce;