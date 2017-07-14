var assert = require('assert');
var notify = require('../server/notify/index.js').default;

describe('sendEmail', function() {
    it('should not produce error', function(done) {
        this.timeout(5000);
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