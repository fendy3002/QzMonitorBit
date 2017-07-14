import path from 'path';
import fs from 'fs';
import lo from 'lodash';
import JSON5 from 'json5';
import dateFormat from 'dateformat';
import notify from '../notify';
import context from "../context.js";

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
    var appConfig = context.appConfig;

    var buffer = [];
    var storage = '../../storage/log';
    var folder = path.join(__dirname, storage, module.filename);
    var lastFlush = new Date();
    var notifier = notify(module);

    var writeBuffer = function(buffer, callback){
        var groupBuffer = getGroup(buffer);
        var earliest = lo.minBy(buffer, k=> (k.success || k.error).time.start);

        var fileName = getFilename((earliest.success || earliest.error).time.start);
        var fullPath = path.join(folder, fileName);
        fs.mkdir(folder, "0777", (err) => {
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
                        existing[currentKey].longest = Math.max(groupBuffer[currentKey].longest);
                    }else{
                        existing[currentKey] = groupBuffer[currentKey];
                    }
                }
                fs.writeFile(fullPath, 
                    JSON.stringify(existing, null, 2), 
                    'utf8', callback);
            });
        });
    };

    var success = (actual) => {
        buffer.push({
            "success": actual
        });
        if(new Date().getTime() - lastFlush.getTime() > (appConfig.logEvery * 1000)){
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
        if(new Date().getTime() - lastFlush.getTime() > (appConfig.logEvery * 1000)){
            var toSendBuffer = buffer;
            flush();
            notifier.flush(toSendBuffer);
        }
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
                writeBuffer(buffer, (err)=>{
                    buffer = [];
                    lastFlush = new Date();
                });
            }
        }
        else{
            writeBuffer(buffer, (err)=>{
                buffer = [];
                lastFlush = new Date();
            });
        }
    };

    return {
        success,
        error,
        flush
    };
};
Service.getFilename = getFilename;
Service.getGroup = getGroup;

export default Service;