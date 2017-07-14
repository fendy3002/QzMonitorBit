import appConfig from '../../config/app.js';
import path from 'path';
import fs from 'fs';
import lo from 'lodash';
import JSON5 from 'json5';
import dateFormat from 'dateformat';
import notify from '../notify';

var storage = '../../storage/log';

var getFilename = (date) => {
    return dateFormat(getMonday(date), "yyyymmdd") + "-" +
        dateFormat(addDays(getMonday(date), 6), "yyyymmdd") + ".log";
};
var getMonday = (d) => {
    d = new Date(d);
    var day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
    return new Date(d.setDate(diff));
};

function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

function pad(num, size) {
    var s = "000000000" + num;
    return s.substr(s.length-size);
};

var writeBuffer = function(buffer, callback){
    var groupBuffer = getGroup(buffer);
    var earliest = lo.minBy(buffer, k=> k.time.start);
    var fileName = getFilename(earliest);
    var fullPath = path.join(storage, fileName);
    fs.readFile(fullPath, "utf8", (err, data) => {
        var existing = {};
        if(!err && data){
            existing = JSON5.parse(data);
        }
        var toWriteKeys = Object.keys(groupBuffer);
        for(var i = 0; i < toWriteKeys.length; i ++){
            var currentKey = toWriteKeys[i];
            if(existing[currentKey]){
                existing[currentKey].success += groupBuffer[currentKey].success;
                existing[currentKey].error += groupBuffer[currentKey].error;
                existing[currentKey].longest = Math.max(groupBuffer[currentKey].success);
            }else{
                existing[currentKey] = groupBuffer[currentKey];
            }
        }

        fs.writeFile(fullPath, JSON.stringify(existing), callback);
    });
};
var getGroup = function(buffer){
    var group = {};
    for(var i = 0; i < buffer.length; i++){
        var currentBuffer = buffer[i];
        var success = currentBuffer.success ? true : false;
        var time = (currentBuffer.success || currentBuffer.error).time;
        var hour = time.start.getHours();
        var minute = Math.ceil(time.start.getMinutes() / 10) * 10;

        var key = "_" + pad(hour, 2).toString() + pad(minute, 2).toString();
        if(!group[key]){
            group[key] = {
                success: success ? 1 : 0,
                error: success ? 0 : 1,
                longest: time.diff
            };
        }
        else{
            group[key].success += success ? 1 : 0;
            group[key].error += success ? 0 : 1;
            group[key].longest = success ? 
                Math.max(group[key].longest, time.diff) : 
                group[key].longest;
        }
    }
    return group;
};

var Service = (module) => {
    var buffer = [];
    var folder = path.join(storage, module.filename);
    var lastFlush = new Date();
    var notifier = notify(module);

    var success = (actual) => {
        buffer.push({
            "success": actual
        });
        if(new Date().getTime() - lastFlush.getTime() > appConfig.logEvery){
            var toSendBuffer = buffer;
            flush();
            notifier.flush(toSendBuffer);
        }
    };
    var error = (actual) => {
        buffer.push({
            "error": actual
        });
        notifier.error(actual);
        flush();
    };

    var flush = () => {
        // if monday morning
        if(new Date().getDay() == 1 && new Date().getHours() == 0){
            var minDate = lo.minBy(buffer.time.start);
            // if buffer still has sunday data
            if(minDate.getDay() == 0){
                writeBuffer(lo.filter(buffer, k=> k.getDay() == 0), ()=>{
                    writeBuffer(lo.filter(buffer, k=> k.getDay() == 1), ()=>{
                        buffer = [];
                        lastFlush = new Date();
                    });
                });
            }
            else{
                writeBuffer(buffer, ()=>{
                    buffer = [];
                    lastFlush = new Date();
                });
            }
        }
        else{
            writeBuffer(buffer, ()=>{
                buffer = [];
                lastFlush = new Date();
            });
        }
    };

    return {
        queue,
        flush
    };
};
Service.getFilename = getFilename;
Service.getGroup = getGroup;

export default Service;