
// Main libraries
var hds = require('hds'),
    debug = require('debug')('db-manager:app');

// Middleware
var gzip = require('koa-gzip'),
    session = require('koa-generic-session'),
    rt = require('koa-rt'),
    main = require('./main'),
    middleware = require('./middleware');

module.exports = function*(app, options) {

    debug('loading standard application');

    app.use(gzip({
        minLength: 150
    }));

    app.use(rt({
        timer: Date,
        headerName: 'X-Response-Time'
    }));

    middleware.style(app, options);

    app.keys = ['key']; // TODO secret keys
    app.use(session());

    // CSRF
    var csrf = require('koa-csrf');
    csrf(app);

// Local object for templates
    var locals = require('koa-locals');
    locals(app, {});
    app.use(function*(next) {
        this.locals._csrf = this.csrf;
        // this.locals._isLogged = this.isAuthenticated();
        // this.locals._user = this.req.user;
        this.locals._host = this.protocol + '://' + this.host;
        yield next;
    });

    main(app, options);

    debug('middlewares mounted');

    yield hds.init(options.hds);

    app.close = function (cb) {
        hds.close(cb);
    };

    debug('hds ready');
};