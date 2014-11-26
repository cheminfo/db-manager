//global.Promise = require('bluebird');

var DBManager = require('../');

var manager = new DBManager('/home/mzasso/node/db-manager/test/usr');

manager.start();