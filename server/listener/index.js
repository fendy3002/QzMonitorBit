import appConfig from '../../config/app.js';
import path from 'path';
import fs from 'fs';
import lo from 'lodash';
import dateFormat from 'dateformat';

var storage = '../../storage';

var getFilename = (date) => {
    return dateFormat(getMonday(date), "yyyymmdd") + "-" +
        dateFormat(addDays(getMonday(date), 6), "yyyymmdd") + ".log";
}
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

var Service = (module) => {
    var buffer = [];
    var folder = path.join(storage, module.filename);
    var lastFlush = new Date();
    var error = (actual, message) => {
        console.log("error", message);
        flush();
    };
    var success = (actual) => {
        console.log("success", actual);
        queue({
            "success": actual
        });
    };

    var queue = (actual) => {
        buffer.push({
            "success": actual
        });
        if(new Date().getTime() - lastFlush.getTime() > appConfig.logEvery){
            flush();
        }
    }
    var flush = () => {

        buffer = [];
        lastFlush = new Date();
    };

    return {
        error, 
        success
    };
};
Service.getFilename = getFilename;

export default Service;