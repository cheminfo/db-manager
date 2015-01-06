global.Promise = require('bluebird');
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

console.log('Starting...');

var program = require('commander');

program
    .option('-d, --debug', 'Enable debug messages')
    .parse(process.argv);

// If debug mode is on, add db-manager to the ENV variable to enable the debug lib
var debug = program.debug;
if (debug) {
    process.env.DEBUG = (process.env.DEBUG || '') + ',db-manager:*';
}

// Disable ugly mongoose warning
// TODO remove when mongoose 4.0.0 is out
process.env.MONGOOSE_DISABLE_STABILITY_WARNING = true;

// Look for configuration file
var config;
try {
    config = require('./usr/config.json');
} catch (e) {
    try {
        config = require('./src/config.default.json');
    } catch (e) {
        console.error('No configuration file found. Did you erase the default one ? :(');
        process.exit(1);
    }
}

var DBManager = require('./src/index');
var manager = new DBManager(config, debug);

manager.start().then(function() {
    var readline = require('readline');
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.on('line', function (line) {
        switch(line) {
            case 'r':
                return manager.restart();
            case 'q':
                manager.close();
                rl.close();
                break;
        }
    });
}, function (error) {
    console.error(error.stack);
    process.exit(1);
});
