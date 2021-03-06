var assert = require('assert');
var context = require('../server/context.js').default;
var notify = require('../server/notify/index.js').default;

describe('sendEmail', function() {
    it('should not produce error', function(done) {
        this.timeout(7000);
        context.appConfig = {
            "port": 3000,
            "logEvery": 10, // in second
            "listener":{
                "http": {
                    "timeout": 2, // in second
                    "error": {
                        "status": "Response status code: %s",
                        "different": "Response different than expected",
                        "notJSON": "Response body is incorrect as JSON",
                        "http": "Cannot perform http request"
                    }
                }
            },
            "escalation": {
                "1": 10,
                "2": 60, // 1 minute
                "3": 600, // 10 minutes
                "4": 3600, // 1 hour
                "5": 14400 // 4 hour
            },
            "sender": {
                "default": {
                    "transporter": {
                        "host": 'smtp.mailtrap.io',
                        "port": 2525,
                        //"secure": true, // secure:true for port 465, secure:false for port 587
                        "auth": {
                            "user": '41aa46954237a4',
                            "pass": '4249c9f3d343bb'
                        }
                    },
                    "from": "username@example.com"
                }
            },
            "mail": {
                "http": {
                    "error": {
                        "subject": '%NAME% cannot be accessed at %NOW%', // Subject line
                        "text": '%NAME% cannot be accessed by %ACCESS%', // plain text body
                        "html": '<b>%NAME%</b> cannot be accessed by %ACCESS%, with data:\n' + 
                            '<pre/>%ACTUAL%</pre>' // html body
                    },
                    "recover": {
                        "subject": '%NAME% at %NOW% is now online', // Subject line
                        "text": '%NAME% at %ACCESS%  is now online', // plain text body
                        "html": '<b>%NAME%</b> at %ACCESS% is now online, with data:\n' + 
                            '<pre/>%ACTUAL%</pre>' // html body
                    }
                }
            }
        };
        var module = {
            "name": "Server 1",
            "type": "http",
            "url": "https://httpbin.org/get",
            "method": "get",
            "expect": {
                "code": 200,
                "header": {
                    "content-type": "application/json"
                }
            },
            "interval": 10, // in seconds
            "notify": {
                "email": [{
                    "use": "default",
                    "to": "fendy3002@gmail.com"
                }],
                "api": [{"https": ""}]
            }
        };
        var callback = (err, info) => {
            assert.equal(err, null);
            done();
        };
        notify(module, callback).error({
            "time": {"end": new Date()},
            "message": "ERROR"
        });
    });
});