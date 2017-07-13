var http = require('http');
var https = require('https');
import verify from "./verify.js";
import JSON5 from 'json5';
import sprintf from 'sprintf-js';
import appConfig from '../../config/app.js';

var Service = (listener) => function(context, module){
    var invoke = null;
    if(!module.method || module.method == "get") { invoke = module.url.startsWith("https") ? https.get : http.get; }
    if(module.method == "post") { invoke = module.url.startsWith("https") ? https.post : http.post; }

    var handleError = (actual, error = "") => {
        var maxRetry = module.retry || 5;
        if(context.retry < maxRetry){
            context.retry++;
            invoke(module.url, responseCallback);
        }
        else{
            var messageTemplate = {
                ...appConfig.error.http,
                ...module.error
            };
            var message = messageTemplate[error];
            listener.error(actual, message);
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

    var handle = invoke(module.url, responseCallback);
    handle.on("error", err => {
        handleError({err : err.toString()}, "http");
    });
};

export default Service;