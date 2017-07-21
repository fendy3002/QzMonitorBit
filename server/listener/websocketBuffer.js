import path from 'path';
import fs from 'fs';
import lo from 'lodash';
import JSON5 from 'json5';
import writeFileAtomic from 'write-file-atomic';
import notify from '../notify';
import context from "../context.js";
import bufferBase from './bufferBase.js';

var onNewGroup = function(currentBuffer){
    var success = currentBuffer.success ? true : false;
    var time = getTime(currentBuffer);
    return {
        success: success ? 1 : 0,
        error: success ? 0 : 1
    };
};

var onExistingGroup = function(old, currentBuffer){
    var success = currentBuffer.success ? true : false;
    var time = getTime(currentBuffer);
    return {
        success: old.success += success ? 1 : 0,
        error: old.error += success ? 0 : 1
    };
};

var getTime = function(currentBuffer){
    return (currentBuffer.success || currentBuffer.error).time;
};

var Service = (module) => {
    var appConfig = context.appConfig;

    var buffer = [];
    var storage = '../../storage/log';
    var folder = path.join(__dirname, storage, module.filename);
    var lastFlush = new Date();
    var notifier = notify(module);

    var writeBuffer = function(buffer, callback){
        var groupBuffer = bufferBase.getGroup(buffer, getTime, onNewGroup, onExistingGroup);
        var earliest = lo.minBy(buffer, k=> (k.success || k.error).time);

        var fileName = bufferBase.getFilename((earliest.success || earliest.error).time);
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
                    }else{
                        existing[currentKey] = groupBuffer[currentKey];
                    }
                }
                writeFileAtomic(fullPath, 
                    JSON.stringify(existing, null, 2), 
                    {encoding: 'utf8'}, callback);
            });
        });
    };

    var success = (actual) => {
        buffer.push({
            "success": actual
        });
        notifier.recover(actual);
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

    var flush = (done) => {
        done = done || (() => {});
        if(!buffer || buffer.length == 0){ 
            done();
            return;
        }
        
        // if monday morning
        if(new Date().getDay() == 1 && new Date().getHours() == 0){
            var minDate = lo.minBy(buffer, k=> k.time);
            // if buffer still has sunday data
            if(minDate.getDay() == 0){
                writeBuffer(lo.filter(buffer, k=> k.getDay() == 0), ()=>{
                    writeBuffer(lo.filter(buffer, k=> k.getDay() == 1), ()=>{
                        done();
                        buffer = [];
                        lastFlush = new Date();
                    });
                });
            }
            else{
                writeBuffer(buffer, (err)=>{
                    done();
                    buffer = [];
                    lastFlush = new Date();
                });
            }
        }
        else{
            writeBuffer(buffer, (err)=>{
                done();
                buffer = [];
                lastFlush = new Date();
            });
        }
    };

    context.dyingWish.subscribe((done) => {
        flush(done);
    });

    return {
        success,
        error,
        flush
    };
};

Service.onNewGroup = onNewGroup;
Service.onExistingGroup = onExistingGroup;
Service.getTime = getTime;

export default Service;