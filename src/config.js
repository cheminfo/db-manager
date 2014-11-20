// Default configuration

var join = require('path').join;

module.exports = {
    assets: {
        favicon: join(__dirname, 'assets/favicon.png'),
        lib: join(__dirname, 'assets/lib')
    },
    hds: {}
};