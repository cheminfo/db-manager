var debug = require('debug')('db-manager:mailer');

var mailer = require('nodemailer');
var path = require('path');
var swig = require('swig');

var transport,
    tplRoot,
    config;

exports.init = function (manager) {
    config = manager.config.mailer;
    transport = mailer.createTransport(config.options);
    // TODO simplify access to template directory
    tplRoot = path.join(manager.dir.src, 'styles/default/templates/email');
    debug('mailer component loaded');
};

exports.sendTemplate = function (recipient, subject, filename, locals) {
    locals = locals || {};
    return new Promise(function (resolve, reject) {
        swig.renderFile(path.join(tplRoot, filename + '.html'), locals, function (err, output) {
            if (err)
                return reject(err);
            debug('Sending mail to ' + recipient);
            transport.sendMail({
                from: config.sender,
                to: recipient,
                subject: subject,
                html: output
            }, function (err) {
                if (err)
                    return reject(err);
                resolve();
            });
        });
    });
};
