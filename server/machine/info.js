var os = require('os');
import lo from 'lodash';
import context from '../context.js';

var getCpuSnapshot = function(){
    var cpus = {};
    lo.forEach(os.cpus(), (cpu, ix) => {
        var totalTicks = 0;
        var idleTicks = 0;
        
        lo.forOwn(cpu.times, (val, key)=> {
            totalTicks += val;
            if(key == 'idle'){ idleTicks+= val; }
        });
        cpus[ix + 1] = {
            ticks: totalTicks,
            idle: idleTicks
        };
    });
    var sumTicks = 0;
    var sumIdle = 0;
    var count = 0;
    lo.forOwn(cpus, (val, key) => {
        sumTicks += val.ticks;
        sumIdle += val.idle;
        count++;
    });

    cpus.all = {
        no: '(ALL)',
        ticks: sumTicks / count,
        idle: sumIdle / count
    };
    return cpus;
};

var getCpuAvg = function(last, now){
    var result = {};
    lo.forOwn(last, (lastCpu, key) => {
        var nowCpu = now[key];
        //Calculate the difference in idle and total time between the measures
        var idleDiff = nowCpu.idle - lastCpu.idle;
        var ticksDiff = nowCpu.ticks - lastCpu.ticks;

        result[key] = {
            time: new Date(),
            idle: idleDiff,
            ticks: ticksDiff,
            avg: 100 - ~~(100 * idleDiff / ticksDiff)
        };
    });
    return result;
};

var calculateCpu = function(lastCpuSnap, onGetAvg){
    setTimeout(() => {
        var newCpuSnap = getCpuSnapshot();
        if(lastCpuSnap){
            var avgCpu = getCpuAvg(lastCpuSnap, newCpuSnap);
            onGetAvg(avgCpu);
        }
        calculateCpu(newCpuSnap, onGetAvg);
    }, Math.max(context.appConfig.cpuInterval, 1) * 1000);
};

var Service = function(){
    var buffer = {
        cpu: []
    };
    calculateCpu(getCpuSnapshot(), (data) => {
        buffer.cpu.push(data);
    });

    return {
        get: () => {
            var info = {
                cpus: buffer.cpu,
                freemem: {
                    max: 0,
                    min: 0
                }
            };

            info.freemem = os.freemem();
            info.loadAvg = os.loadavg();
            return info;
        }
    };
};

export default Service;