var http = require('http');
var https = require('https');
var url = require('url');
import verify from "./verify.js";
import JSON5 from 'json5';
import sprintf from 'sprintf-js';
import appConfig from '../../config/app.js';

var Service = (listener) => function(context, module){
    var timeout = (module.timeout || appConfig.listener.http.timeout) * 1000;
    
    var requestHandler = null;
    var moduleUrl = url.parse(module.url);
    var requestOption = {
        host: moduleUrl.host,
        path: moduleUrl.pathname,
        port: moduleUrl.port
    };
    if(!module.method || module.method == "get") { requestHandler = module.url.startsWith("https") ? https.get : http.get; }
    if(module.method == "post") { requestHandler = module.url.startsWith("https") ? https.post : http.post; }

    var handleError = (actual, error = "") => {
        actual.error = error;
        var maxRetry = module.retry || 5;
        if(context.retry < maxRetry){
            context.retry++;
            setImmediate(invoke);
        }
        else{
            var messageTemplate = {
                ...appConfig.listener.http.error,
                ...module.error
            };
            var message = messageTemplate[error] || error;
            actual.error = message;
            listener.error(actual);
        }
    };

    var responseCallback = (res) => {
        const { statusCode } = res;
        const contentType = res.headers['content-type'];
        
        var actual = {
            "code" : statusCode,
            "header": {
                "content-type": "application/json"
            },
            "bodyText": ""
        };
        var expect = module.expect;

        res.on('data', (chunk) => { actual.bodyText += chunk; });
        res.on('end', () => {
            var endTime = new Date();
            var diff = endTime.getTime() - context.start.getTime();
            actual.time = {
                start: context.start,
                end: endTime,
                diff: diff
            };
            actual.retry = context.retry;

            if(statusCode == module.expect.code){
                if(expect.body){
                    if(expect.body === "object"){
                        try {
                            const parsedData = JSON5.parse(actual.bodyText);
                            actual.body = parsedData;

                            if(verify(module)(module.expect, actual)){
                                listener.success(actual);
                            }else{
                                handleError(actual, "different");
                            }
                        } catch (e) {
                            handleError(actual, "notJSON");
                        }
                    }
                    else{
                        actual.body = actual.bodyText;
                        if(verify(module)(module.expect, actual)){
                            listener.success(actual);
                        }else{
                            handleError(actual, "different");
                        }
                    }
                } else {
                    if(verify(module)(module.expect, actual)){
                        listener.success(actual);
                    }else{
                        handleError(actual, "different");
                    }
                }
            }
            else{
                handleError(actual, "status");
            }
        });
    };

    var invoke = () => {
        var handle = requestHandler(requestOption, responseCallback);
        handle.on("error", err => {
            var endTime = new Date();
            var diff = endTime.getTime() - context.start.getTime();
            var time = {
                start: context.start,
                end: endTime,
                diff: diff
            };
            if (err.code === "ECONNRESET") {
                handleError({
                    err : err.toString(),
                    time: time
                }, "timeout");
            }
            else{
                handleError({
                    err : err.toString(),
                    time: time
                }, "http");
            }
        });

        handle.setTimeout(timeout, function() {
            handle.abort();
        });
    };
    invoke();
};

export default Service;