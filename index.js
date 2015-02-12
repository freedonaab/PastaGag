'use strict';

var express = require('express');
var kraken = require('kraken-js');
var options = require("./lib/spec");
var flash = require('connect-flash');
var passport = require('passport');
var auth = require('./lib/auth');
var session = require('express-session');
var User = require('./models/users');
var port = port = process.env.PORT || 8000;

var app;

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

app = module.exports = express();

app.on('middleware:after:session', function (eventargs) {

    console.log('middleware:after:session');

    //Tell passport to use our newly created local strategy for authentication
    passport.use(auth.localStrategy());

    //Give passport a way to serialize and deserialize a user. In this case, by the user's id.
    passport.serializeUser(function (user, done) {
        console.log('passport.serializeUser', user);
        done(null, user._id);
    });

    passport.deserializeUser(function (id, done) {
        console.log('passport.deserializeUser');
        User.findOne({_id: id}, function (err, user) {
            done(null, user);
        });
    });
////Use Passport for authentication
    app.use(passport.initialize());
////Persist the user in the session
    app.use(passport.session());
////Use flash for saving/retrieving error messages for the user
    app.use(flash());
////Inject the authenticated user into the response context
    app.use(auth.injectUser);
});

app.use(kraken(options));

app.listen(port, function(err) {
    console.log('[%s] Listening on http://localhost:%d', app.settings.env, port);
});

//app.on('start', function () {
//    console.log('Application ready to serve requests.');
//    console.log('Environment: %s', app.kraken.get('env:env'));
//});
