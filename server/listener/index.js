import appConfig from '../../config/app.js';
import path from 'path';
import fs from 'fs';
import lo from 'lodash';
import dateFormat from 'dateformat';
import httpBuffer from './httpBuffer.js';
import websocketBuffer from './websocketBuffer.js';
import notify from '../notify';

var Service = (module) => {
    if(module.type == "http"){
        var buffer = httpBuffer(module);
        var error = (actual, message) => {
            buffer.error(actual, message);
            buffer.flush();
        };
        var success = (actual) => {
            buffer.success(actual);
        };

        return {
            error, 
            success
        };
    }
    if(module.type == "websocket"){
        var buffer = websocketBuffer(module);
        var error = (actual, message) => {
            buffer.error(actual, message);
            buffer.flush();
        };
        var success = (actual) => {
            buffer.success(actual);
        };

        return {
            error, 
            success
        };
    }
};

export default Service;