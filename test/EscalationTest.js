var assert = require('assert');
var escalationRaw = require('../server/escalation/index.js').default;

describe('escalation', function() {
    it('should auto retry after specified time', function(done) {
        this.timeout(10000);
        var escalationTime = {
            1: 0.1,
            2: 0.2,
            3: 0.5,
            4: 0.7,
            after: 1
        };
        var currentTime = new Date();
        var escalation = escalationRaw(escalationTime);
        
        var totalTime = 0;
        escalation.execRetry((execDone, stop) => {
            var diffTime = new Date().getTime() - currentTime.getTime();
            assert.equal(true, escalation.times() <= 6);
            assert.equal(true, (diffTime - totalTime) < 
                escalationTime[escalation.times()] || escalationTime.after
            );
            totalTime += (diffTime - totalTime);
            if(escalation.times() > 5){
                stop();
                setTimeout(function() {
                    done();
                }, 3000);
            }
            execDone();
        })
    });
    it('should not be executed until several moment elapsed', function(done) {
        this.timeout(10000);
        var escalationTime = {
            1: 0.1,
            2: 0.2,
            3: 0.5,
            4: 0.7,
            after: 1
        };

        var currentTime = new Date();
        var escalation = escalationRaw(escalationTime);

        var totalTime = 0;
        var isStopping = false;
        setInterval(function(){
            if(isStopping){ return; }
            escalation.exec(function(execDone){
                var diffTime = new Date().getTime() - currentTime.getTime();

                assert.equal(true, escalation.times() <= 6);
                assert.equal(true, (diffTime - totalTime) < 
                    escalationTime[escalation.times()] || escalationTime.after
                );
                totalTime += (diffTime - totalTime);
                if(escalation.times() > 5){
                    isStopping = true;
                    done();
                }
                execDone();
            });
        }, 100);
    });
});