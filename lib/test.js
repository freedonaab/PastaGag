'use strict';

var kraken = require('kraken-js'),
    express = require('express'),
    request = require('supertest');

var db = require('./database');
var mongoose = require('mongoose');
var async = require('async');

var mapCookies = function (cookies) {
    return cookies.map(function (r) {
        return r.replace('; path=/; httponly', '');
    }).join('; ');
};

module.exports = {

    mapCookies: mapCookies,


    beforeEach: function (config) {

        return function (done) {

            async.waterfall([
                function (next) {
                    //create a express mock
                    config.app = express();
                    config.app.on('start', next);
                    config.app.use(kraken({
                        basedir: process.cwd(),
                        onconfig: function (config, next) {
                            db.config(config.get('database').test);
                            next(null, config);
                        }
                    }));
                    config.mock = config.app.listen(1337);
                },
                function (next) {
                    //use hard coded route to get a csrf token
                    request(config.mock)
                        .get('/csrf')
                        .end(function (err, res) {
                            next(null, res);
                        });
                },
                function (res, next) {
                    config.res = res;
                    //drop database
                    mongoose.connection.db.dropDatabase(next);
                }
            ], function (err, res) {
                done();
            });


        };
    },

    afterEach: function (config) {
        return function (done) {
            async.waterfall([
                function (next) {
                    config.mock.close(next);
                },
                function (next) {
                    //drop database
                    mongoose.connection.db.dropDatabase(next);
                },
                function (_, next) {
                    //properly close mongo connection to that it can be reused for another unit test
                    mongoose.disconnect();
                    next();
                }
            ], function (err, res) {
                done();
            });

        };
    },


//{
//    email: "mouloud1@hotmail.fr",
//        username: "kebab94",
//    password: "wallah123"
//}
    createUser: function (config, user) {

        return function (next) {
            request(config.mock)
                .post('/users')
                .set('Cookie', mapCookies(config.res.headers['set-cookie']))
                .send({
                    _csrf: config.res.body._csrf,
                    metadata: {},
                    data: {
                        user: user
                    }
                })
                .expect(200, function (err, res) {
                    next(null, res);
                });
        };
    }
};
