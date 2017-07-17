var assert = require('assert');
var context = require('../server/context.js').default;
var machineInfo = require('../server/machine/info.js').default;

describe('test', function() {
    it('should return info', function(done) {
        this.timeout(20000);
        context.appConfig = {
            "port": 3000,
            "logEvery": 10, // in second
            "cpuInterval": 1 // in second
        };
        var info = machineInfo();

        setTimeout(function() {
            console.log(info.get());
            done();
        }, 10000);
    });
});
