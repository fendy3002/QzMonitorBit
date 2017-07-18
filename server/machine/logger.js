import path from 'path';
import fs from 'fs';
import lo from 'lodash';
import JSON5 from 'json5';
import bufferBase from '../listener/bufferBase.js';
import dateFormat from 'dateformat';
import context from "../context.js";
var mergeExisting = (existing, info) => {
    var result = {};
    var mergeCpu = (existing, info) => {
        var result = JSON.parse(JSON.stringify(existing));
        lo.forOwn(info, (cpus, key) => {
            result[key] = {};
            lo.forOwn(cpus, (cpu, cpuNo) => {
                if(cpuNo == "time"){ return; }
                else{
                    result[key][cpuNo] = cpu;
                }
            });
        });
        return result;
    };
    var mergeMem = (existing, info) => {
        var mem = JSON.parse(JSON.stringify(existing));
        lo.forOwn(info, (val, key) => {
            mem[key] = {
                minFreeGb: val.minFreeGb,
                maxFreeGb: val.maxFreeGb,
                minUseGb: val.minUseGb,
                maxUseGb: val.maxUseGb,
                minPercent: val.minPercent,
                maxPercent: val.maxPercent
            };
        });
        return mem;
    };

    result.cpu = mergeCpu(existing.cpu, info.cpu);
    result.mem = mergeMem(existing.mem, info.mem);
    return result;
};
var Service = () => {
    var appConfig = context.appConfig;

    var storage = '../../storage/log';
    var folder = path.join(__dirname, storage, "MonitorBit");

    var writeBuffer = function(time, buffer, callback){
        var fileName = bufferBase.getFilename(time);
        var fullPath = path.join(folder, fileName);
        fs.mkdir(folder, "0777", (err) => {
            fs.readFile(fullPath, "utf8", (err, data) => {
                var existing = {};
                if(!err && data){
                    existing = JSON5.parse(data);
                }
                else{
                    existing = {
                        cpu: {},
                        mem: {}
                    }
                }
                var toWrite = mergeExisting(existing, buffer);
                console.log("toWrite", toWrite);
                fs.writeFile(fullPath, 
                    JSON.stringify(existing, null, 2), 
                    'utf8', callback);
            });
        });
    };

    var write = function(buffer, callback){
        console.log("buffer", buffer);
        if(new Date().getDay() == 1 && new Date().getHours() == 0){

        }
        else{
            writeBuffer(new Date(), buffer, callback);
        }
    };

    return {
        write
    };
};

export default Service;