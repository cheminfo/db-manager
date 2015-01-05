var crypto = require('crypto');

exports.getRandomSalt = function (byteLength) {
    byteLength = byteLength || 32;
    return crypto.pseudoRandomBytes(byteLength).toString('hex');
};

exports.getPasswordHash = function (password, salt) {
    var hash = crypto.createHash('sha256');
    hash.setEncoding('hex');
    hash.write(salt + password);
    hash.end();
    return hash.read().toString();
};
