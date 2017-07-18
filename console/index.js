var prepare = require('./prepare.js');

var Service = function(args, root){
    var helpLine = "QzMonitorBit exec.js\n" +
        "====================\n" +
        "Used by specifying the following commands:\n" +
        "prepare\t To prepare freshly cloned git. Run this command after clone / install\n" +
        "fprepare\t Prepare without checking, overwrite existing config\n"
        "help\t To show this page";

    var Prepare = prepare(root);
    if(args.length == 0){
        console.log(helpLine);
    }
    else{
        var command = args[0];
        if(command == "help"){
            console.log(helpLine);
        }
        else if(command == "prepare"){
            if(Prepare.canPrepare()){
                Prepare.prepare();                
            }
        }
        else if(command == "fprepare"){
            Prepare.prepare();
        }
        else{
            console.log(helpLine);
        }
    }
};

module.exports = Service;