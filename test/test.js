var manager = require('../');

manager().then(function (koa) {

    koa.listen(3000)

}, function (err) {
    console.log('error');
    console.log(err);
});