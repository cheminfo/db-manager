
// Main libraries
var hds = require('hds'),
    debug = require('debug')('db-manager:app');

// Middleware
var gzip = require('koa-gzip'),
    session = require('koa-generic-session'),
    rt = require('koa-rt'),
    main = require('./main'),
    middleware = require('./middleware'),
    csrf = require('koa-csrf');

module.exports = function*(app, usrDir) {

    debug('loading standard application');

    app.use(gzip({
        minLength: 150
    }));

    app.use(rt({
        timer: Date,
        headerName: 'X-Response-Time'
    }));

    middleware.common(app, usrDir);

    app.keys = ['key']; // TODO secret keys
    app.use(session());

    csrf(app);

    // Authentication
    require('./util/auth');
    var passport = require('koa-passport');
    app.use(passport.initialize());
    app.use(passport.session());

    app.use(function*(next) {
        this.locals._csrf = this.csrf;
        // this.locals._isLogged = this.isAuthenticated();
        // this.locals._user = this.req.user;
        this.locals._host = this.protocol + '://' + this.host;
        yield next;
    });

    main(app, usrDir);

    debug('middlewares mounted');

    // TODO look for config

    yield hds.init(options.hds);

    app.close = function*() {
        yield hds.close();
    };

    debug('hds ready');
};