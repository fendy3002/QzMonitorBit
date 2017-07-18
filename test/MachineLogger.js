var assert = require('assert');
var context = require('../server/context.js').default;
var loggerRaw = require('../server/machine/logger.js').default;

describe('separateByDate', function() {
    it('should separate the buffer by date', function(done) {
        var buffer = {
            "cpu": {
                "_2340": {
                    "1": {
                        "minUsage": "3.59",
                        "maxUsage": "4.76"
                    },
                    "all": {
                        "minUsage": "2.09",
                        "maxUsage": "2.31"
                    },
                    "time": "2015-01-01T23:49:01"
                },
                "_2350": {
                    "1": {
                        "minUsage": "3.59",
                        "maxUsage": "4.76"
                    },
                    "all": {
                        "minUsage": "2.09",
                        "maxUsage": "2.31"
                    },
                    "time": "2015-01-01T23:50:01"
                },
                "_0000": {
                    "1": {
                        "minUsage": "3.59",
                        "maxUsage": "4.76"
                    },
                    "all": {
                        "minUsage": "2.09",
                        "maxUsage": "2.31"
                    },
                    "time": "2015-01-02T00:00:01"
                }
                
            },
            "mem": {
                "_2340": {
                    "time": "2015-01-01T23:49:01",
                    "minFreeGb": "1.95",
                    "maxFreeGb": "1.97",
                    "minUseGb": "5.65",
                    "maxUseGb": "5.66",
                    "minPercent": "74.11",
                    "maxPercent": "74.24"
                },
                "_2350": {
                    "time": "2015-01-01T23:50:01",
                    "minFreeGb": "1.95",
                    "maxFreeGb": "1.97",
                    "minUseGb": "5.65",
                    "maxUseGb": "5.66",
                    "minPercent": "74.11",
                    "maxPercent": "74.24"
                },
                "_0000": {
                    "time": "2015-01-02T00:00:01",
                    "minFreeGb": "1.95",
                    "maxFreeGb": "1.97",
                    "minUseGb": "5.65",
                    "maxUseGb": "5.66",
                    "minPercent": "74.11",
                    "maxPercent": "74.24"
                },
            }
        };

        var separated = loggerRaw().separateByDate(buffer);
        assert.equal(true, separated.yesterday.cpu._2340 != null);
        assert.equal(true, separated.yesterday.cpu._2350 != null);
        assert.equal(true, separated.yesterday.mem._2340 != null);
        assert.equal(true, separated.yesterday.mem._2350 != null);
        assert.equal(true, separated.today.cpu._2340 == null);
        assert.equal(true, separated.today.mem._2340 == null);

        assert.equal(true, separated.today.cpu._0000 != null);
        assert.equal(true, separated.today.mem._0000 != null);
        
        done();
    });
});