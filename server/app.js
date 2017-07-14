import appConfig from '../config/app.js';
import socket from 'socket.io';
import path from 'path';
import dispatcher from './dispatcher';
import context from './context.js';

var io = socket(appConfig.port);
context.io = io;
context.appConfig = appConfig;
dispatcher(path.join(__dirname, "../config/listener"));

console.log("Websocket running on port " + appConfig.port);