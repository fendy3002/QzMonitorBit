import appConfig from '../config/app.js';
import socket from 'socket.io';
import path from 'path';
import dispatcher from './dispatcher';
import context from './context.js';

// ignore tls verify certificate
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var io = socket(appConfig.port);
context.io = io;
context.appConfig = appConfig;
dispatcher(path.join(__dirname, "../config/listener"));

/*
var socket2 = require('socket.io-client')(
    'http://localhost:3001', {
        autoConnect: false,
        rejectUnauthorized: false,
        transports: [ 'websocket' ],
	    upgrade: false
    }
);

socket2.on('connect_error', (err) => {
    console.log("connect_error", err);
});
socket2.on('connect_timeout', (data) => {
    console.log("connect timeout", data);
});
socket2.on('reconnect', (data) => {
    console.log("reconnect", data);
});
socket2.on('reconnect_attempt', (data) => {
    console.log("reconnect_attempt", data);
});
socket2.on('signal', (data) =>{
    console.log("signal", data);
});
socket2.on('connecting', () =>{
    console.log("connecting");
});
socket2.on('connect', () =>{
    console.log("connect");
});

//socket2.connect();

var socket3 = require('socket.io-client')(
    'http://localhost:3001/ns', {
        autoConnect: false,
        rejectUnauthorized: false,
        transports: [ 'websocket' ],
	    upgrade: false
    }
);
socket3.on('connect', () =>{
    console.log("socket3 connect");
});
socket3.connect();*/

console.log("Websocket running on port " + appConfig.port);