var co = require('co'),
    koa = require('koa'),
    debug = require('debug')('db-manager:main'),
    http = require('http'),
    join = require('path').join,
    fs = require('mz/fs');

var install = require('./install'),
    load = require('./load');

var sockets = {}, nextSocketId = 0;

function Manager(config, debug) {
    this.config = config;
    this.debug = debug;
    // TODO get rid of this
    this.usrDir = __dirname;
    this.started = false;
    this.restarting = true;
    this.server = null;
    this.app = null;
    this.port = config.port;
}

Manager.prototype.start = function () {
    var self = this;
    if (this.started) {
        return;
    }
    this.started = true;
    return this.getApp().then(function (app) {
        return self.bindApp(app);
    });
};

Manager.prototype.restart = function () {
    if (this.restarting) {
        return;
    }
    this.restarting = true;
    console.log('Restarting...');
    var self = this;
    self.server.close(function () {
        debug('server closed');
        self.app.close().then(function () {
            debug('app closed');
            self.getApp().then(function (app) {
                self.running = false;
                self.bindApp(app);
            });
        });
    });
    debug('closing remaining sockets');
    for (var socketId in sockets) {
        if(sockets.hasOwnProperty(socketId)) {
            sockets[socketId].destroy();
        }
    }
};

Manager.prototype.bindApp = function (app) {
    var self = this;
    return new Promise(function (resolve, reject) {
        debug('binding app');
        self.server = http.createServer(app.callback());
        self.server.on('connection', function (socket) {
            var socketId = nextSocketId++;
            sockets[socketId] = socket;
            socket.on('close', function () {
                delete sockets[socketId];
            });
        });
        self.server.on('error', function (e) {
            reject(e);
        });
        self.server.listen(self.port, function () {
            console.log('listening on port ' + self.port);
            resolve();
            self.restarting = false;
        });
    });
};

Manager.prototype.getApp = function () {
    var self = this;
    return co(function*() {
        var app = koa();

        // check if config file is present. If not, start installation process
        var installed = true;
        try {
            var config = yield fs.readFile(join(self.usrDir, 'config.json'));
        } catch (e) {
            installed = false;
        }

        if(!installed) {
            yield install(app, self.usrDir);
        } else {
            yield load(app, self.usrDir);
        }

        self.app = app;
        app.manager = self;
        return app;
    });
};

module.exports = Manager;
