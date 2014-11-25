var Router = require('koa-router'),
    fs = require('mz/fs'),
    join = require('path').join,
    debug = require('debug')('db-manager:install'),
    middleware = require('./middleware'),
    hds = require('hds'),
    mongodb = require('hds/node_modules/mongoose').mongo,//hds.mongo TODO change when hds is updated
    validator = require('validator');

module.exports = function*(app, options) {

    debug('loading install application');

    middleware.common(app, options);

    var router = new Router();

    app.context.locals.db = {
        host: 'localhost',
        name: 'hds',
        port: 27017
    };

    router.get('/', function*() {
        yield this.render('install/index');
    });

    router.get('/step1', function*() {
        yield this.render('install/step1');
    });

    router.post('/step1', function*() {
        var body = this.request.body;
        if(!body) {
            return;
        }
        this.locals.db = {
            host: body.host,
            port: parseInt(body.port) || 27017,
            username: body.username,
            password: body.password,
            name: body.name
        };
        this.redirect('/step2');
    });

    router.post('/checkDB', function*() {
        var body = this.request.body;
        if(!body) {
            return;
        }
        var host = body.host || '127.0.0.1',
            port = body.port,
            username = body.username,
            password = body.password,
            database = body.database;
        var connectionStr =
            'mongodb://' +
            (username ? (username+':'+password+'@') : '') +
            host +
            (port ? (':' + port) : '') +
            '/' + database;
        var dbOk = yield checkDB(connectionStr);
        if(dbOk) {
            this.body = {ok: true, message: 'mongoDB connection OK'};
        } else {
            this.body = {ok: false, message: 'unable to connect'};
        }
    });

    function checkDB(connectionStr) {
        return function (callback) {
            mongodb.MongoClient.connect(connectionStr, function (err, db) {
                if(err) {
                    return callback(null, false);
                }
                db.close(function () {
                    callback(null, true);
                });
            })
        };
    }

    router.get('/step2', function*() {
        yield this.render('install/step2');
    });

    router.post('/step2', function*() {
        var body = this.request.body;
        if(!body) {
            return;
        }
        var mail = body.email,
            pass = body.password;
        if(!validator.isEmail(mail)) {
            this.body = 'Not an email';
        } else {
            yield createDB(this.locals.db, mail, pass);
            this.redirect('/finish');
        }
    });

    function*createDB(db, mail, pass) {
        yield hds.init({
            database: db
        });
        var User = hds.customCollection('users', new hds.Schema({
            email: String,
            password: String
        }));
        var admin = new User({
            email: mail,
            password: pass
        });
        yield admin.save.bind(admin);
    }

    router.get('/finish', function*() {
        this.body = 'Installation done. Restarting server...';

        if(!(yield fs.exists(options.data))) {
            yield fs.mkdir(options.data);
        }

        yield fs.writeFile(join(options.data, 'config.json'), '{}');

        var self = this;
        setTimeout(function () {
            self.app.manager.restart();
        }, 1000);

    });

    app.use(router.middleware());

    app.close = function(cb) {
        cb();
    };

};