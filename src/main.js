var Router = require('koa-router');

module.exports = function (app, usrDir) {

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

    baseRouter.get('/restart', function*() {
        this.app.manager.restart();
    });

    app.use(baseRouter.middleware());

};