import JSON5 from 'json5';
import sprintf from 'sprintf-js';
import context from '../context.js';
import assertEquals from './assertEquals.js';
import escalationRaw from '../escalation';
import lo from 'lodash';
import io from 'socket.io-client';

var Service = (listener) => function(module){
    var appConfig = context.appConfig;

    var retry = 0;
    var maxRetry = module.retry || 5;
    var escalation = escalationRaw(appConfig.escalation);
    var escalationStop = null;

    var handleError = ({on, data}, message) => {
        var time = new Date();

    };
    var connect = () =>{
        var socket = io(context.url);
        socket.on('connect', () =>{
            if(escalationStop){ escalationStop(); }
            lo.forOwn(module.on, (val, evt) => {
                socket.on(evt, (data) => {
                    if(!assertEquals(data, val.expected)){
                        handleError({
                            on: evt,
                            data: data
                        }, "different");
                    }
                });
            });
            lo.forOwn(module.emit, (val, evt) => {
                socket.emit(evt, val.data);
                lo.forOwn(val.on, (onVal, onEvt) => {
                    socket.on(onEvt, (data) => {
                        if(!assertEquals(data, onVal.expected)){
                            if(retry >= maxRetry){
                                handleError({
                                    on: onEvt,
                                    data: data
                                }, "different");
                            }
                            else{
                                retry++;
                                socket.emit(evt, val.data);
                            }
                        }
                        else{
                            retry = 0;
                            setTimeout(function() {
                                socket.emit(evt, val.data);
                            }, val.interval);
                        }
                    });
                });
            });
        });
        socket.on('disconnect', () => {
            handleError({}, "disconnect");
            escalation.execRetry((done, stop) => {
                connect();
                done();
                escalationStop = stop;
            });
        });
    };

    connect();
};

export default Service;