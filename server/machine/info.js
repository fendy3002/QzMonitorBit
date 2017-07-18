var os = require('os');
import lo from 'lodash';
import dateFormat from 'dateformat';
import context from '../context.js';
import loggerRaw from './logger.js';
import notifyRaw from './notify.js';

function pad(num, size) {
    var s = "000000000" + num;
    return s.substr(s.length-size);
};

function getGroupKey(time){
    var hour = time.getHours();
    var minute = Math.floor(time.getMinutes() / 10) * 10;
    var bufferDateFormat = dateFormat(time, "mmmdd_hh");

    return "_" + bufferDateFormat + pad(minute, 2).toString();
}

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
    var result = {
        time: new Date()        
    };
    lo.forOwn(last, (lastCpu, key) => {
        var nowCpu = now[key];
        //Calculate the difference in idle and total time between the measures
        var idleDiff = nowCpu.idle - lastCpu.idle;
        var ticksDiff = nowCpu.ticks - lastCpu.ticks;

        result[key] = {
            idle: idleDiff,
            ticks: ticksDiff,
            percent: (100 - (100 * idleDiff / ticksDiff)).toFixed(2)
        };
    });
    return result;
};

var calculateCpu = function(lastCpuSnap, onGetAvg){
    var newCpuSnap = getCpuSnapshot();
    if(lastCpuSnap){
        var avgCpu = getCpuAvg(lastCpuSnap, newCpuSnap);
        onGetAvg(avgCpu);
    }
    setTimeout(() => {
        calculateCpu(newCpuSnap, onGetAvg);
    }, Math.max(context.appConfig.cpuInterval, 1) * 1000);
};

var calculateMem = function(onGetAvg){
    var newFreeMem = os.freemem();
    var avgMem = {
        time: new Date(),
        free: os.freemem(),
        use: os.totalmem() - os.freemem(),
        percent: (100 - (os.freemem() / os.totalmem() * 100)).toFixed(2)
    };
    onGetAvg(avgMem);

    setTimeout(() => {
        calculateMem(onGetAvg);
    }, Math.max(context.appConfig.cpuInterval, 1) * 1000);
};

var cpuGroupByTenMinute = function(buffers){
    var result = {};
    lo.forEach(buffers, buffer => {
        var groupKey = getGroupKey(buffer.time);
        var group = {
            time: buffer.time
        };
        if(result[groupKey]){
            var group = result[groupKey];
        }
        
        lo.forOwn(buffer, (cpu, cpuNo) => {
            if(cpuNo == "time"){ return; }
            group[cpuNo] = group[cpuNo] || [];
            group[cpuNo].push(cpu);
        });
        result[groupKey] = group;
    });
    return result;
};

var cpuGroupToInfo = function(grouped){
    var cpus = {};
    lo.forOwn(grouped, (group, key) => {
        cpus[key] = { time: group.time };
        lo.forOwn(group, (val, cpuNo) => {
            if(cpuNo == "time"){ return; }
            var minPercent = lo.minBy(val, k=> k.percent);
            cpus[key][cpuNo] = {
                minUsage: minPercent.percent,
                maxUsage: lo.maxBy(val, k=> k.percent).percent
            }
        });
    });
    return cpus;
};

var memGroupByTenMinute = function(buffers){
    var result = {};
    lo.forEach(buffers, buffer => {
        var groupKey = getGroupKey(buffer.time);
        result[groupKey] = result[groupKey] || {
            time: buffer.time,
            mem: []
        };
        result[groupKey].mem.push(buffer);
    });
    return result;
};
var memGroupToInfo = function(grouped){
    var mems = {};
    var oneGb = 1024 * 1024 * 1024;
    
    lo.forOwn(grouped, (group, key) => {
        var minFree = 0;
        var maxFree = 0;
        var minUse = 0;
        var maxUse = 0;
        var minPercent = 0;
        var maxPercent = 0;
        lo.forEach(group.mem, (mem, ix) => {
            if(ix == 0){
                minFree = mem.free;
                minUse = mem.use;
                minPercent = mem.percent;
            }else{
                minFree = minFree < mem.free ? minFree : mem.free;
                minUse = minUse < mem.use ? minUse : mem.use;
                minPercent = minPercent < mem.percent ? minPercent : mem.percent;

                maxFree = maxFree > mem.free ? maxFree : mem.free;
                maxUse = maxUse > mem.use ? maxUse : mem.use;
                maxPercent = maxPercent > mem.percent ? maxPercent : mem.percent;
            }
        })
        mems[key] = {
            time: group.time,
            minFreeGb: (minFree / oneGb).toFixed(2),
            maxFreeGb: (maxFree / oneGb).toFixed(2),
            minUseGb: (minUse / oneGb).toFixed(2),
            maxUseGb: (maxUse / oneGb).toFixed(2),
            minPercent: minPercent,
            maxPercent: maxPercent
        }
    });
    return mems;
};

var Service = function(){
    var buffer = {
        cpu: [],
        mem: []
    };
    var logger = loggerRaw();
    var notify = notifyRaw();
    calculateCpu(null, (data) => {
        buffer.cpu.push(data);
    });
    calculateMem((data) => {
        buffer.mem.push(data);
    });

    var watch = () => {
        var info = {
            cpu: cpuGroupToInfo(cpuGroupByTenMinute(buffer.cpu)),
            mem: memGroupToInfo(memGroupByTenMinute(buffer.mem)) 
        };
        var currentDate = new Date();
        var currentHour = new Date(currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate(),
            currentDate.getHours(),
            0, 0);

        logger.write(info, ()=>{            
            setTimeout(function() {
                watch();
            }, Math.max(context.appConfig.logEvery, 1) * 1000);
            buffer.cpu = lo.filter(buffer.cpu, k=> k.time >= currentHour);
            buffer.mem = lo.filter(buffer.mem, k=> k.time >= currentHour);
        });
        notify.info(info);
    };

    return {
        watch
    };
};
Service.getCpuSnapshot = getCpuSnapshot;
Service.getCpuAvg = getCpuAvg;
Service.cpuGroupByTenMinute = cpuGroupByTenMinute;
Service.cpuGroupToInfo = cpuGroupToInfo;

export default Service;