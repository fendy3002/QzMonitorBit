var http = require('http');
var https = require('https');
import verify from "./verify.js";
import JSON5 from 'json5';
import sprintf from 'sprintf-js';
import appConfig from '../../config/app.js';
import invokeHttp from './invokeHttp.js';

var Service = function(module, listener){
    if(module.type == "http"){
        var invoke = invokeHttp(listener);
        var invokeContext = { retry : 0, start : new Date()};
        invoke(invokeContext, module);
        setInterval(() => {
            invokeContext = { retry : 0, start : new Date()};
            invoke(invokeContext, module);
        }, module.interval * 1000);
    }
};

export default Service;