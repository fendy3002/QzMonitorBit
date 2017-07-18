const fs = require('fs');
const path = require('path');
const JSON5 = require('json5');

var Service = function(root){
	var copyFile = function(fromPath, toPath){
		var fromFile = fs.createReadStream(fromPath);
    	var toFile = fs.createWriteStream(toPath);
    	
	    fromFile.pipe(toFile);
	    fromFile.on('end', () => {
	        console.log("Copying " + fromPath + " files done");
	    });
	}
	return {
		canPrepare: function(){
		    console.log("Checking if can prepare...");
		    var folder = path.join(root, "config");
		    if(fs.existsSync(path.join(folder, "app.js"))){
		        console.log("Config already exists, use fprepare command to force prepare.");
		        console.log("Ignore this command if executed from npm install.");
		        return false;
		    }
		    return true;
		},
		prepare: function(){
		    console.log("Copying query files...");
		    var folder = path.join(root, "config");

		    copyFile(path.join(folder, 'app.js.example'),
	    		path.join(folder, 'app.js'));
		}
	};
};

module.exports = Service;