// Check support for ES6 generators
var generator = 'function*test(){}';
try {
    eval(generator);
} catch (e) {
    if (e instanceof SyntaxError) {
        console.error('Generators not supported. This script must be run with the --harmony flag.');
    } else {
        console.error('Unexpected error', e);
    }
    process.exit(1);
}

var program = require('commander');

program
    .option('-d, --debug', 'Enable debug messages')
    .parse(process.argv);

// If debug mode is on, add db-manager to the ENV variable to enable the debug lib
if (program.debug) {
    process.env.DEBUG = (process.env.DEBUG || '') + ',db-manager:*';
} else {
    console.log('Starting...');
}

// Disable ugly mongoose warning
// TODO remove when mongoose 4.0.0 is out
process.env.MONGOOSE_DISABLE_STABILITY_WARNING = true;

var DBManager = require('./src/index');
var manager = new DBManager();

manager.start().then(function () {
    if (!program.debug) {
        console.log('Server listening on port ' + manager.port);
    }
});
