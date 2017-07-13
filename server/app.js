import appConfig from '../config/app.js';
import socket from 'socket.io';
import path from 'path';
import dispatcher from './dispatcher';
import listener from './listener';

var io = socket(appConfig.port);
dispatcher(path.join(__dirname, "../config/listener"), listener);

console.log("App running on port " + appConfig.port);