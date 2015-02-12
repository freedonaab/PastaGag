'use strict';
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/users');


exports.localStrategy = function () {

    return new LocalStrategy(function (username, password, done) {

        console.log('LocalStrategy', arguments);
        //Retrieve the user from the database by login
        User.findOne({username: username}, function (err, user) {

            //If something weird happens, abort.
            if (err) {
                return done(err);
            }

            //If we couldn't find a matching user, flash a message explaining what happened
            if (!user) {
                //return done(null, false, { message: 'Login not found' });
                //return done({ error: 'Login not found' }, false);
                return done(null, false);
            }

            //Make sure that the provided password matches what's in the DB.
            if (!user.passwordMatches(password)) {
                //return done(null, false, { message: 'Incorrect Password' });
                //return done({ error: 'Incorrect Password' }, false);
                return done(null, false);
            }

            //If everything passes, return the retrieved user object.
            done(null, user);
        });
    });
};

exports.isAuthenticated = function (role, redirect) {

    return function (req, res, next) {


        if (!req.isAuthenticated()) {

            if (redirect) {
                //If the user is not authorized, save the location that was being accessed so we can redirect afterwards.
                req.session.goingTo = req.url;
                res.redirect('/');
            } else {
                res.status(401);
                res.render('errors/401');
            }
            return;
        }

        //If a role was specified, make sure that the user has it.
        if (role && req.user.role !== role) {
            res.status(401);
            res.render('errors/401');
        }

        next();
    };
};

exports.injectUser = function (req, res, next) {

    console.log('injectUser');
    if (!req.isAuthenticated) {
        console.log('WARNING: req.isAuthenticated not defined!');
    } else {
        console.log('isAuthenticated: '+req.isAuthenticated());
    }
    if (req.isAuthenticated && req.isAuthenticated()) {
        res.locals.user = req.user;
    }
    next();
};

