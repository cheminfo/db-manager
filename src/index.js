var co = require('co'),
    koa = require('koa'),
    debug = require('debug')('db-manager:main'),
    http = require('http'),
    join = require('path').join;

var install = require('./install'),
    load = require('./load');

var sockets = {}, nextSocketId = 0;

function Manager(config, debug) {
    this.config = config;
    this.debug = debug;
    this.dir = {
        src: __dirname,
        usr: join(__dirname, '../usr')
    };
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
        self.server.on('error', reject);
        self.server.listen(self.port, function () {
            console.log('listening on port ' + self.port);
            self.restarting = false;
            resolve();
        });
    });
};

Manager.prototype.getApp = co.wrap(function*() {
    var app = koa();
    this.app = app;
    app.manager = this;
    var config = this.config;
    if(!config.version) {
        yield install(app);
    } /*
     else if (config.version !== this.version) {
     yield upgrade(app);
     }*/ else {
        yield load(app);
    }
    return app;
});

Manager.prototype.version = 1;

module.exports = Manager;
