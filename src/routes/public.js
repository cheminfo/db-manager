var Router = require('koa-router');

var router = new Router();

router.get('/', function*() {
    yield this.render('index');
});

exports.middleware = router.middleware.bind(router);
