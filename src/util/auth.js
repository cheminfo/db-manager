var passport = require('koa-passport');
var crypto = require('./crypto');
var User = require('../models/user');

passport.serializeUser(function (user, done) {
    done(null, user._id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, done);
});

var errMessage = {
    message: 'Wrong username or password'
};
var LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(function (username, password, done) {

    User.findOne({email: username}, function (err, user) {
        if (err) {
            done(err);
        } else if (user) {
            var hash = crypto.getPasswordHash(password, user.salt);
            if (hash === user.password) { // Success
                done(null, user);
            } else { // Wrong password
                done(null, false, errMessage);
            }
        } else { // User not found
            done(null, false, errMessage);
        }
    });

}));

/*
 var FacebookStrategy = require('passport-facebook').Strategy
 passport.use(new FacebookStrategy({
 clientID: 'your-client-id',
 clientSecret: 'your-secret',
 callbackURL: 'http://localhost:' + (process.env.PORT || 3000) + '/auth/facebook/callback'
 },
 function(token, tokenSecret, profile, done) {
 // retrieve user ...
 done(null, user)
 }
 ))

 var TwitterStrategy = require('passport-twitter').Strategy
 passport.use(new TwitterStrategy({
 consumerKey: 'your-consumer-key',
 consumerSecret: 'your-secret',
 callbackURL: 'http://localhost:' + (process.env.PORT || 3000) + '/auth/twitter/callback'
 },
 function(token, tokenSecret, profile, done) {
 // retrieve user ...
 done(null, user)
 }
 ))

 var GoogleStrategy = require('passport-google').Strategy
 passport.use(new GoogleStrategy({
 returnURL: 'http://localhost:' + (process.env.PORT || 3000) + '/auth/google/callback',
 realm: 'http://localhost:' + (process.env.PORT || 3000)
 },
 function(identifier, profile, done) {
 // retrieve user ...
 done(null, user)
 }
 ))
 */
