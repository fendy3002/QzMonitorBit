import appConfig from '../config/app.js';
import socket from 'socket.io';
import path from 'path';
import dispatcher from './dispatcher';

var io = socket(appConfig.port);
dispatcher(path.join(__dirname, "../config/listener"));

console.log("App running on port " + appConfig.port);