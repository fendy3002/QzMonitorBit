var assert = require('assert');
var context = require('../server/context.js').default;
var machineInfo = require('../server/machine/info.js').default;

describe('getCpuSnapshot', function() {
    it('should has info for all cpu', function(done) {
        var info = machineInfo.getCpuSnapshot();
        assert.equal(true, info.all != null);
        assert.equal(true, info.all.ticks > 0);
        assert.equal(true, info.all.idle > 0);

        done();
    });
});
describe('getCpuAvg', function() {
    it('should has info for all cpu', function(done) {
        var info1 = machineInfo.getCpuSnapshot();    
        setTimeout(function() {
            var info2 = machineInfo.getCpuSnapshot();
            var avg = machineInfo.getCpuAvg(info1, info2);
            assert.equal(true, avg.all != null);
            assert.equal(true, avg.all.percent >= 0);
            assert.equal(true, avg.all.percent <= 100);
            done();
        }, 500);
    });
});

describe('cpuGroupByTenMinute', function() {
    it('should convert array of cpu info to grouped one', function(done){
        var buffer = [{
            "time": new Date("2017-07-17T01:01:01"),            
            "1": {
                "idle": 5000,
                "ticks": 5100,
                "percent": "1.96"
            },
            "all": {
                "idle": 5000,
                "ticks": 5100,
                "percent": "1.96"
            }
        }, {
            "time": new Date("2017-07-17T01:02:00"),
            "1": {
                "idle": 5000,
                "ticks": 5100,
                "percent": "1.96"
            },
            "all": {
                "idle": 5000,
                "ticks": 5100,
                "percent": "1.96"
            }
        }, {
            "time": new Date("2017-07-17T01:20:00"),
            "1": {
                "idle": 5000,
                "ticks": 5100,
                "percent": "1.96"
            },
            "all": {
                "idle": 5000,
                "ticks": 5100,
                "percent": "1.96"
            }
        }];
        
        var grouped = machineInfo.cpuGroupByTenMinute(buffer);
        assert.equal(2, grouped["_Jul17_0800"]["1"].length);
        assert.equal(1, grouped["_Jul17_0820"]["1"].length);
        done();
    });
});

describe('cpuGroupToInfo', function() {
    it("should show average", function(done){
        var grouped = {
            "_Jul17_0800": {
                "1": [
                    {
                        "time": "2017-07-17T01:01:01.000Z",
                        "idle": 5000,
                        "ticks": 5100,
                        "percent": "1.96"
                    },
                    {
                        "time": "2017-07-17T01:01:00.000Z",
                        "idle": 5000,
                        "ticks": 5100,
                        "percent": "1.96"
                    }
                ],
                "all": [
                    {
                        "time": "2017-07-17T01:01:01.000Z",
                        "idle": 5000,
                        "ticks": 5100,
                        "percent": "1.96"
                    },
                    {
                        "time": "2017-07-17T01:01:00.000Z",
                        "idle": 5000,
                        "ticks": 5100,
                        "percent": "1.96"
                    }
                ]
            },
            "_Jul17_0820": {
                "1": [
                    {
                        "time": "2017-07-17T01:20:00.000Z",
                        "idle": 5000,
                        "ticks": 5100,
                        "percent": "1.96"
                    }
                ],
                "all": [
                    {
                        "time": "2017-07-17T01:20:00.000Z",
                        "idle": 5000,
                        "ticks": 5100,
                        "percent": "1.96"
                    }
                ]
            }
        };

        var cpuInfo = machineInfo.cpuGroupToInfo(grouped);
        assert.equal(true, cpuInfo._Jul17_0800.all.minUsage >= 0 && cpuInfo._Jul17_0800.all.minUsage <= 100);
        assert.equal(true, cpuInfo._Jul17_0800.all.maxUsage >= 0 && cpuInfo._Jul17_0800.all.maxUsage <= 100);
        assert.equal(true, cpuInfo._Jul17_0820.all.minUsage >= 0 && cpuInfo._Jul17_0820.all.minUsage <= 100);
        assert.equal(true, cpuInfo._Jul17_0820.all.maxUsage >= 0 && cpuInfo._Jul17_0820.all.maxUsage <= 100);
        done();
    });
});

/*
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
*/