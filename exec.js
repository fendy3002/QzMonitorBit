var exec = require('./console/index.js');

var args = process.argv.slice(2);
exec(args, __dirname);