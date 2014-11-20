// Main libraries
var co = require('co'),
    koa = require('koa'),
    extend = require('extend'),
    hds = require('hds'),
    debug = require('debug')('db-manager:main');

// Middleware
var favicon = require('koa-favicon'),
    serve = require('koa-static'),
    mount = require('koa-mount'),
    gzip = require('koa-gzip'),
    session = require('koa-generic-session'),
    rt = require('koa-rt');

// Default config
var defaults = require('./config');

module.exports = co.wrap(function*(options) {

    options = extend(true, {}, defaults, options);

    debug('creating new application');

    var app = koa();

    app.use(gzip({
        minLength: 150
    }));

    app.use(rt({
        timer: Date,
        headerName: 'X-Response-Time'
    }));

    app.use(favicon(options.assets.favicon, {
        maxAge: 1000 * 60 * 60 * 24
    }));

    app.use(mount('/lib', serve(options.assets.lib, {
        maxage: 0,
        hidden: false,
        index: 'index.html'
    })));

    app.keys = ['key']; // TODO secret keys
    app.use(session());

    debug('middlewares mounted');

    yield hds.init(options.hds);

    debug('hds ready');

    return app;

});