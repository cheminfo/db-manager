var debug = require('debug')('db-manager:authentication');

var passport = require('koa-passport');
var validator = require('validator');

var mailer = require('../util/mailer');

var User = require('../models/user');
var UserToken = require('../models/token');

exports.login = function*() {
    this.assertCSRF(this.request.body);
    var ctx = this;
    yield passport.authenticate('local', function*(err, user) {
        if (err) {
            throw err;
        }
        if (!user) {
            ctx.flash = {
                loginMessage: 'Wrong username or password',
                loginMail: ctx.request.body.username
            };
        } else {
            yield ctx.login(user);
        }
        ctx.redirect('/');
    });
};

exports.logout = function*() {
    this.logout();
    this.redirect('/');
};

exports.registerGet = function*() {
    yield this.render('authentication/register');
};

exports.registerPost = function*() {
    this.assertCSRF(this.request.body);
    var mail = this.request.body.email;
    debug('trying to register with ' + mail);
    if (!validator.isEmail(mail)) {
        this.flash = {
            notEmailMessage: 'Not an email',
            notEmailValue: mail
        };
        this.redirect('/register');
    } else {
        if (!(yield User.exists(mail))) {
            var token = yield UserToken.createForName(mail);
            mailer.sendTemplate(mail, 'Registration requested', 'registration-token', {
                token: token,
                _host: this.state._host
            });
        } else {
            debug('user ' + mail + ' already exists');
        }
        yield this.render('authentication/register-mailsent');
    }
};

exports.registerConfirmGet = function*() {
    var token;
    if (token = this.query.token) {
        if (token.length !== 64)
            return;
        yield this.render('authentication/register-confirm', { token: token });
    }
};

exports.registerConfirmPost = function*() {
    this.assertCSRF(this.request.body);
    var password = this.request.body.password,
        token = this.request.body.token;
    if (password && token) {
        debug('trying to create a new user using token and password');
        var mail = yield UserToken.getName(token);
        if (mail) {
            yield create(mail, password);
            yield this.render('authentication/register-finished', {mail: mail});
        }
    }
};

function*create(email, password) {
    var user = new User({
        email: email
    });
    user.changePassword(password);
    yield user.save.bind(user);
}
