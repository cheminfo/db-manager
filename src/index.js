/*
 Force installation of bluebird
 Currently, native promises are slower and create bug with http server
 */
/*try {
    var bluebird = require('bluebird');
} catch (e) {
    throw new Error('bluebird must be installed');
}
if (typeof Promise === 'undefined' || Promise !== bluebird) {
    throw new Error('bluebird must be installed globally (global.Promise = require(\'bluebird\'))');
}*/

// Main libraries
var co = require('co'),
    koa = require('koa'),
    extend = require('extend'),
    debug = require('debug')('db-manager:main'),
    http = require('http'),
    join = require('path').join,
    fs = require('mz/fs');

var install = require('./install'),
    load = require('./load');

var sockets = {}, nextSocketId = 0;

function Manager(usrDir) {
    this.usrDir = usrDir || join(__dirname, '../usr');
    this.started = false;
    this.restarting = true;
    this.server = null;
    this.app = null;
    this.port = 0;
}

Manager.prototype.start = function (port) {
    var self = this;
    if (this.started) {
        return;
    }
    debug('starting server');
    this.port = (port | 0) || 3000;
    this.started = true;
    return this.getApp().then(function (app) {
        self.bindApp(app);
    }, function (err) {
        console.log(err.stack)
    });
};

Manager.prototype.restart = function () {
    if (this.restarting) {
        return;
    }
    this.restarting = true;
    debug('restarting server');
    var self = this;
    self.server.close(function () {
        debug('server closed');
        self.app.close(function () {
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
    debug('binding app');
    this.server = http.createServer(app.callback());
    this.server.on('connection', function (socket) {
        var socketId = nextSocketId++;
        sockets[socketId] = socket;
        socket.on('close', function () {
            delete sockets[socketId];
        });
    });
    this.server.listen(this.port, function () {
        debug('listening on port ' + self.port);
        self.restarting = false;
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
