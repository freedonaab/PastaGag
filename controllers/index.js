'use strict';


var IndexModel = require('../models/index');
var passport = require('passport');

module.exports = function (router) {

    var model = new IndexModel();


    router.get('/',
        function (req, res, next) {
            next();
        },
        function (req, res) {
            console.log(res.locals);
            var user = null;
            if (res.locals.user) {
                console.log(res.locals.user.toObject);
                user = res.locals.user.toObject();
                delete user._id;
            }
            res.render('index', {
                _csrf: res.locals._csrf,
                isAuthenticated: req.isAuthenticated().toString(),
                username: user? user.username : "",
                password: user? user.password : "",
                email: user? user.email : ""
            });
        }
    );

    router.get('/csrf',
        function (req, res) {
            res.send({ _csrf: res.locals._csrf });
        }
    );

    router.post('/login', function (req, res, next) {
        console.log('POST /login reached!');
        //passport.authenticate('local', {
        //    successRedirect: req.session.goingTo || '/',
        //    failureRedirect: '/',
        //    failureFlash: false
        //})(req, res, next);
        passport.authenticate('local', {
            successRedirect: req.session.goingTo || '/',
            failureFlash: false
        })(req, res, next);
        //passport.authenticate('local', function (err, user) {
        //    console.log(arguments);
        //    if (err) {
        //        res.status(401).send(err);
        //    } else {
        //        res.redirect(req.session.goingTo || '/');
        //    }
        //})(req, res, next);
    });

    router.post('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

};
