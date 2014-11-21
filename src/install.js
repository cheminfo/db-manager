var Router = require('koa-router'),
    fs = require('mz/fs'),
    join = require('path').join,
    debug = require('debug')('db-manager:install'),
    middleware = require('./middleware');

module.exports = function*(app, options) {

    debug('loading install application');

    middleware.style(app, options);

    var router = new Router();

    router.get('/', function*() {
        this.body = '<html><body>Installation. <a href="/step1">Step 1</a></body></html>';
    });

    router.get('/step1', function*() {
        this.body = '<html><body>Step1. <a href="/finish">Finish</a></body></html>';
    });

    router.get('/finish', function*() {
        this.body = 'Installation done. Restarting server...';

        if(!(yield fs.exists(options.data))) {
            yield fs.mkdir(options.data);
        }

        yield fs.writeFile(join(options.data, 'config.json'), '{}');

        var self = this;
        setTimeout(function () {
            self.app.manager.restart();
        }, 1000);

    });

    app.use(router.middleware());

    app.close = function(cb) {
        cb();
    };

};