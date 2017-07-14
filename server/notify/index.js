import email from './email.js';
import lo from 'lodash';
var Service = function(module, callback){
    callback = callback || (() => {});
    var notifiers = [];
    if(module.notify){
        if(module.notify.email){
            notifiers = notifiers.concat(
                lo.map(module.notify.email, k=> {
                    return email(module, k, callback);
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

    return {
        error,
        flush
    };
};

export default Service;