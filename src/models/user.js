var Schema = require('hds').Schema,
    validator = require('validator'),
    crypto = require('../util/crypto'),
    hds = require('hds');

var schema = new Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        validate: validator.isEmail
    },
    salt: {
        type: String,
        'default': crypto.getRandomSalt
    },
    password: {
        type: String,
        'default': crypto.getRandomSalt
    }
});

schema.methods.changePassword = function (newPassword) {
    var newSalt = crypto.getRandomSalt();
    var hashedPassword = crypto.getPasswordHash(newPassword, newSalt);
    this.set({
        salt: newSalt,
        password: hashedPassword
    });
};

schema.statics.exists = function*(email) {
    var count = yield Model.count({email: email}).exec();
    return !!count;
};

var Model = module.exports = hds.customCollection('users', schema);