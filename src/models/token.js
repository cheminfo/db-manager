/**
 * This model allows to create and check random temporary tokens identified by a name
 * If a matching token is found, the system removes it from the database
 */
var hds = require('hds'),
    Schema = hds.Schema,
    crypto = require('../util/crypto');

var schema = new Schema({
    createdAt: {
        type: Date,
        'default': Date.now,
        expires: '15m'
    },
    token: {
        type: String,
        'default': crypto.getRandomSalt
    },
    _id: String
});

schema.statics.createForName = function*(name) {
    var doc = yield Model.findById(name).exec();
    if (doc) {
        doc.set({
            token: crypto.getRandomSalt(),
            createdAt: Date.now()
        });
    } else {
        doc = new Model({ _id: name });
    }
    yield doc.save.bind(doc);
    return doc.token;
};

schema.statics.getName = function*(token) {
    var res = yield Model.findOneAndRemove({token: token}, {_id: 1}).exec();
    if(res) {
        return res._id;
    }
};

schema.statics.match = function*(token, name) {
    var res = yield Model.findOneAndRemove({_id: name, token: token}).exec();
    return !!res;
};

var Model = module.exports = hds.customCollection('token_', schema);
