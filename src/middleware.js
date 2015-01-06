var join = require('path').join,
    mount = require('koa-mount');

exports.common = function(app) {

    var gzip = require('koa-gzip');
    app.use(gzip({
        minLength: 150
    }));

    var rt = require('koa-rt');
    app.use(rt({
        timer: Date,
        headerName: 'X-Response-Time'
    }));

    var session = require('koa-generic-session');
    app.keys = [app.config.secret];
    app.use(session());

    var csrf = require('koa-csrf');
    csrf(app);

    app.use(function*(next) {
        this.state._csrf = this.csrf;
        this.state._host = this.protocol + '://' + this.host;
        yield next;
    });

    var flash = require('koa-flash');
    app.use(flash());

    // TODO look for style in config
    var style = 'default';
    style = join(__dirname, 'styles', style);

    var serve = require('koa-static');
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

    var bodyparser = require('koa-bodyparser');
    app.use(bodyparser());

    app.use(function*(next) {
        try {
            yield next;
            if (this.status === 404 && !this.body) {
                yield this.render('errors/404');
            }
        } catch(err) {
            this.status = err.status || 500;
            app.emit('error', err, this);
            if (app.manager.debug) {
                this.state.fullError = String(err.stack).replace(/[\r\n]+/g, '<br>');
            }
            yield this.render('errors/500');
        }
    });



};
