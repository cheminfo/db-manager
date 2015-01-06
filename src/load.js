
// Main libraries
var hds = require('hds'),
    debug = require('debug')('db-manager:app');

// Middleware
var main = require('./main'),
    middleware = require('./middleware');

module.exports = function*(app, usrDir) {

    debug('loading standard application');

    middleware.common(app, usrDir);

    // Authentication
    require('./util/auth');
    var passport = require('koa-passport');
    app.use(passport.initialize());
    app.use(passport.session());

    app.use(function*(next) {
        // this.state._isLogged = this.isAuthenticated();
        // this.state._user = this.req.user;
        yield next;
    });

    main(app, usrDir);

    debug('middlewares mounted');

    // TODO look for config

    yield hds.init(app.manager.config.db);
    debug('hds ready');

    app.close = function () {
        return hds.close();
    };

};
