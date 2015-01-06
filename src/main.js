var publicRoutes = require('./routes/public');
var authRoutes = require('./routes/authentication');

module.exports = function (app) {

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

    app.use(publicRoutes.middleware());
    app.use(authRoutes.middleware());

};
