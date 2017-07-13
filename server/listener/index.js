import appConfig from '../../config/app.js';
import path from 'path';
import fs from 'fs';
import lo from 'lodash';
import dateFormat from 'dateformat';
import bufferRaw from './buffer.js';

var Service = (module) => {
    var buffer = bufferRaw(module);
    var folder = path.join(storage, module.filename);
    var error = (actual, message) => {
        console.log("error", message);
        buffer.queue({
            "error": actual
        });
        buffer.flush();
    };
    var success = (actual) => {
        console.log("success", actual);
        buffer.queue({
            "success": actual
        });
    };

    return {
        error, 
        success
    };
};
Service.getFilename = getFilename;

export default Service;