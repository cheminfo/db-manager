var generator = 'function*test(){}';
try {
    eval(generator);
} catch (e) {
    if (e instanceof SyntaxError) {
        console.error('Generators not supported. This script must be run with the --harmony flag.');
        process.exit(1);
    }
}

var program = require('commander');

program
    .option('-d, --debug', 'Enable debug messages')
    .parse(process.argv);

if (program.debug) {
    process.env.DEBUG = (process.env.DEBUG || '') + ',db-manager:*';
} else {
    console.log('Starting...');
}

process.env.MONGOOSE_DISABLE_STABILITY_WARNING = true;

var DBManager = require('./');
var manager = new DBManager('/home/mzasso/git/cheminfo/db-manager/src');

manager.start().then(function () {
    if (!program.debug) {
        console.log('Server listening on port ' + manager.port);
    }
});
