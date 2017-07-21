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

    var escalationContext = {
        stopHandle: null
    };
    var messageTemplate = {
        ...appConfig.listener.websocket.error,
        ...module.error
    };

    var handleError = ({on, data}, message) => {
        var time = new Date();
        message = messageTemplate[message] || message;
        listener.error({
            on: on,
            data: data,
            time: time,
            error: message
        });
    };
    var socketOption = {
        autoConnect: false,
        rejectUnauthorized: false,
        transports: [ 'websocket' ],
	    upgrade: false,
        reconnectionAttempts: 5
    };
    var socket = io(module.url, socketOption);

    var connect = () => {
        socket.on('connect_error', (err) => {
            handleError({
                error: err.toString()
            }, "connect_error");
        });
        socket.on('connect', () =>{
            if(escalationContext.stopHandle){ 
                escalationContext.stopHandle();
                escalationContext.stopHandle = null;
            }
            lo.forOwn(module.on, (val, evt) => {
                socket.on(evt, (data) => {
                    if(!assertEquals(val.expected, data)){
                        handleError({
                            on: evt,
                            data: data
                        }, "different");
                    }
                    else{
                        listener.success(
                            {
                                time: new Date(),
                                on: evt,
                                data: data
                            }
                        );
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
                            listener.success(
                                {
                                    time: new Date(),
                                    on: evt,
                                    data: data
                                }
                            );
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
                escalationContext.stopHandle = stop;
            });
        });
        
        socket.connect();
    };

    connect();
};

export default Service;