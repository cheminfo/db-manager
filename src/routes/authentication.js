var Router = require('koa-router');

var controller = require('../controllers/authentication');

var router = new Router();

router.post('/login', controller.login);
router.get('/logout', controller.logout);
router.get('/register', controller.registerGet);
router.post('/register', controller.registerPost);
router.get('/register/confirm', controller.registerConfirmGet);
router.post('/register/confirm', controller.registerConfirmPost);

exports.middleware = router.middleware.bind(router);
