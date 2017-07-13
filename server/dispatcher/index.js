import fs from 'fs';
import path from 'path';
import JSON5 from 'json5';
import invoker from '../invoker';
import listenerRaw from '../listener';

var Service = function(folder){
    var files = fs.readdirSync(folder);
	for(var i = 0; i < files.length; i++){
		var file = files[i];
		if(file.startsWith('.')){ continue; }
        var fullpath = path.join(folder, file);
        var module = ReadModule(fullpath);
        module.filename = file;
        var listener = listenerRaw(module);
        invoker(module, listener);
    }
};

var ReadModule = function(file){
    var content = fs.readFileSync(file, "utf8");
    return JSON5.parse(content);
};

export default Service;