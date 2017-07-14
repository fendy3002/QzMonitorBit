import appConfig from '../../config/app.js';
import path from 'path';
import fs from 'fs';
import lo from 'lodash';
import dateFormat from 'dateformat';
import bufferRaw from './buffer.js';
import notify from '../notify';

var Service = (module) => {

    var buffer = bufferRaw(module);
    var folder = path.join(storage, module.filename);
    var error = (actual, message) => {
        buffer.error(actual, message);
        buffer.flush();
    };
    var success = (actual) => {
        buffer.queue({
            "success": actual
        });
    };

    return {
        error, 
        success
    };
};

export default Service;