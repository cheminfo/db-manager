var Router = require('koa-router');

module.exports = function (app, options) {

    var baseRouter = new Router();

    var menu = options.menu;

    app.use(function*(next) {

        var newMenu = [];

        for (var i = 0; i < menu.length; i++) {
            newMenu.push(menu[i]);
        }

        this.locals.menu = newMenu;

        yield next;

    });

    menu.forEach(function (el) {
        baseRouter.get(el.url, function*() {
            yield this.render(el.page);
        });
    });

    baseRouter.get('/restart', function*() {
        this.app.manager.restart();
    });

    app.use(baseRouter.middleware());

};