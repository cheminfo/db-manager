var join = require('path').join,
    serve = require('koa-static'),
    mount = require('koa-mount');

exports.style = function(app, options) {

    var style = options.style || 'default';
    if (style.indexOf('/') == -1) {
        style = join(__dirname, 'styles', style);
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

};