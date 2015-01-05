var program = require('commander');

program
    .option('-d, --debug', 'Enable debug messages')
    .parse(process.argv);

if (program.debug) {
    process.env.DEBUG = (process.env.DEBUG || '') + ',db-manager:*';
}

process.env.MONGOOSE_DISABLE_STABILITY_WARNING = true;

var DBManager = require('./');
var manager = new DBManager('/home/mzasso/git/cheminfo/db-manager/src');

manager.start();
