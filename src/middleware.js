var join = require('path').join,
    serve = require('koa-static'),
    mount = require('koa-mount'),
    bodyparser = require('koa-bodyparser'),
    gzip = require('koa-gzip'),
    session = require('koa-generic-session'),
    rt = require('koa-rt'),
    csrf = require('koa-csrf'),
    flash = require('koa-flash');

exports.common = function(app) {

    app.use(gzip({
        minLength: 150
    }));

    app.use(rt({
        timer: Date,
        headerName: 'X-Response-Time'
    }));

    app.keys = ['key']; // TODO secret keys
    app.use(session());

    csrf(app);

    app.use(function*(next) {
        this.state._csrf = this.csrf;
        this.state._host = this.protocol + '://' + this.host;
        yield next;
    });

    app.use(flash());

    // TODO look for style in config
    var style = /*options.style ||*/ 'default';
    style = join(__dirname, 'styles', style);

    app.use(mount('/assets', serve(join(style, 'assets'), {
        maxage: 0,
        hidden: false,
        index: false,
        defer: false
    })));

    var render = require('koa-swig');
    render(app, {
        root: join(style, 'templates'),
        autoescape: true,
        cache: false,//'memory',
        ext: 'html'
    });

    app.use(bodyparser());

};
