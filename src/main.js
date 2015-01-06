var Router = require('koa-router');

module.exports = function (app) {

    var baseRouter = new Router();

    app.use(function*(next) {

        /* TODO build menu
        var newMenu = [];

        for (var i = 0; i < menu.length; i++) {
            newMenu.push(menu[i]);
        }

        this.locals.menu = newMenu;

        */

        yield next;

    });

    baseRouter.get('/', function*() {
        yield this.render('index')
    });

    app.use(baseRouter.middleware());

};
