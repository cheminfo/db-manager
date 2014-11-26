var join = require('path').join,
    serve = require('koa-static'),
    mount = require('koa-mount'),
    locals = require('koa-locals'),
    bodyparser = require('koa-bodyparser');

exports.common = function(app, usrDir) {

    // TODO look for style in config
    var style = options.style || 'default';
    if (style.indexOf('/') == -1) {
        style = join(usrDir, 'styles', style);
    }
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

    // Local object for templates
    locals(app, {});

    app.use(bodyparser());

};