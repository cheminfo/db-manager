var Router = require('koa-router'),
    fs = require('mz/fs'),
    join = require('path').join,
    debug = require('debug')('db-manager:install'),
    middleware = require('./middleware'),
    hds = require('hds'),
    mongodb = hds.mongo,
    validator = require('validator'),
    User = require('./models/user');

module.exports = function*(app) {

    debug('loading install application');

    middleware.common(app);

    var router = new Router();

    var db = {
        host: 'localhost',
        name: 'hds',
        port: 27017
    };

    app.use(function*(next) {
        this.state.db = db;
        yield next;
    });

    router.get('/', function*() {
        yield this.render('install/index');
    });

    router.get('/step1', function*() {
        yield this.render('install/step1');
    });

    router.post('/step1', function*() {
        var body = this.request.body;
        if (!body) {
            return;
        }
        db = {
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
        if (!body) {
            return;
        }
        var host = body.host || '127.0.0.1',
            port = body.port,
            username = body.username,
            password = body.password,
            database = body.database;
        var connectionStr =
            'mongodb://' +
            (username ? (username + ':' + password + '@') : '') +
            host +
            (port ? (':' + port) : '') +
            '/' + database;
        var dbOk = yield checkDB(connectionStr);
        if (dbOk) {
            this.body = {ok: true, message: 'mongoDB connection OK'};
        } else {
            this.body = {ok: false, message: 'unable to connect'};
        }
    });

    function checkDB(connectionStr) {
        return function (callback) {
            mongodb.MongoClient.connect(connectionStr, function (err, db) {
                if (err) {
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
        if (!body) {
            return;
        }
        var mail = body.email,
            pass = body.password;
        if (!validator.isEmail(mail)) {
            this.flash = { notEmailMessage: 'Not an email', notEmailValue: mail };
            this.redirect('/step2');
        } else {
            yield createDB(db, mail, pass);
            this.redirect('/finish');
        }
    });

    function*createDB(db, mail, pass) {
        yield hds.init({
            database: db
        });
        var admin = new User({
            email: mail,
            role: User.Roles.ADMIN
        });
        admin.changePassword(pass);
        yield admin.save.bind(admin);
    }

    router.get('/finish', function*() {
        this.body = 'Installation done. Restarting server...';

        if (!(yield fs.exists(app.manager.dir.usr))) {
            yield fs.mkdir(app.manager.dir.usr);
        }

        app.manager.config.db = db;
        app.manager.config.version = app.manager.version;

        yield fs.writeFile(join(app.manager.dir.usr, 'config.json'), JSON.stringify(app.manager.config, null, 2));

        var self = this;
        setTimeout(function () {
            self.app.manager.restart();
        }, 1000);

    });

    app.use(router.middleware());

    app.close = function () {
        return hds.close();
    };

};
