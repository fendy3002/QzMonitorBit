import appConfig from '../config/app.js';
import socket from 'socket.io';
import path from 'path';
import dispatcher from './dispatcher';
import context from './context.js';

var io = socket(appConfig.port);
context.io = io;
context.appConfig = appConfig;
dispatcher(path.join(__dirname, "../config/listener"));

process.env['BABEL_CACHE_PATH'] = path.join(__dirname, '../storage');

console.log("Websocket running on port " + appConfig.port);