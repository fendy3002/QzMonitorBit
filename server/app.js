import appConfig from '../config/app.js';
import socket from 'socket.io';
import path from 'path';
import nodeCleanup from 'node-cleanup';
import dispatcher from './dispatcher';
import context from './context.js';
import dyingWish from './dyingWish';

// ignore tls verify certificate
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var io = socket(appConfig.port);
context.io = io;
context.appConfig = appConfig;
context.dyingWish = dyingWish();
dispatcher(path.join(__dirname, "../config/listener"));

nodeCleanup(function (exitCode, signal) {
    if (signal) {
      context.dyingWish.shutdown(function () {
          // calling process.exit() won't inform parent process of signal
          process.kill(process.pid, signal);
      });
      nodeCleanup.uninstall(); // don't call cleanup handler again
      return false;
    }
});

console.log("Websocket running on port " + appConfig.port);