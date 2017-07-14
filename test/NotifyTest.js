var assert = require('assert');
var context = require('../server/context.js').default;
var notify = require('../server/notify/index.js').default;

describe('sendEmail', function() {
    it('should not produce error', function(done) {
        this.timeout(5000);
        context.appConfig = {
            "port": 3000,
            "logEvery": 10, // in second
            "error": {
                "http": {
                    "status": "Response status code: %s",
                    "different": "Response different than expected",
                    "notJSON": "Response body is incorrect as JSON",
                    "http": "Cannot perform http request"
                }
            },
            "mail": {
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
                    "from": "41aa46954237a4@inbox.mailtrap.io",
                    "message": {
                        "subject": '%NAME% cannot be accessed at %NOW%', // Subject line
                        "text": '%NAME% cannot be accessed by %ACCESS%', // plain text body
                        "html": '<b>%NAME%</b> cannot be accessed by %ACCESS%, with data:\n' + 
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