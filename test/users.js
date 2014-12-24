/*global describe:false, it:false, beforeEach:false, afterEach:false*/

'use strict';


var kraken = require('kraken-js');
var express = require('express');
var request = require('supertest');
var should = require('should');
var async = require('async');
var options = require("../lib/spec");
var db = require("../lib/database");
var mongoose = require('mongoose');


var mapCookies = function (cookies) {
    return cookies.map(function (r) {
        return r.replace("; path=/; httponly", "");
    }).join("; ");
};

describe('users', function () {

    var app, mock;

    var __res = null;

    beforeEach(function (done) {

        async.waterfall([
            function (next) {
                //create a express mock
                app = express();
                app.on('start', next);
                app.use(kraken({
                    basedir: process.cwd(),
                    onconfig: function (config, next) {
                        db.config(config.get('database')["test"]);
                        next(null, config);
                    }
                }));

                mock = app.listen(1337);
            },
            function (next) {
                //use hard coded route to get a csrf token
                request(mock)
                    .get('/csrf')
                    .end(function (err, res) {
                        next(null, res);
                    });
            },
            function (res, next) {
                __res = res;
                //drop database
                mongoose.connection.db.dropDatabase(next);
            }
        ], function (err, res) {
            done();
        });


    });


    afterEach(function (done) {
        async.waterfall([
            function (next) {
                mock.close(next);
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
        ], function (err,res) {
            done();
        });

    });

    it('should create user', function (done) {

        var _csrfToken = null;

        async.waterfall([
            function (next) {
                request(mock)
                    .post('/users')
                    .set('Cookie', mapCookies(__res.headers['set-cookie']))
                    .send({
                        _csrf: __res.body._csrf,
                        metadata: {},
                        data: {
                            user: {
                                email: "mouloud@hotmail.fr",
                                username: "kebab94",
                                password: "wallah123"
                            }
                        }
                    })
                    .expect(200, function (err, res) {

                        should.exist(res);
                        res.should.have.property("body");
                        res.body.should.have.property("metadata");
                        res.body.should.have.property("data");
                        res.body.metadata.should.have.property("success", true);
                        res.body.metadata.should.have.property("error", null);
                        res.body.metadata.should.have.property("statusCode", 200);
                        res.body.data.should.have.property("user");
                        res.body.data.user.should.have.property("email", "mouloud@hotmail.fr");
                        res.body.data.user.should.have.property("username", "kebab94");
                        res.body.data.user.should.have.property("password", "wallah123");
                        res.body.data.user.should.have.property("created_at");
                        res.body.data.user.should.have.property("updated_at");
                        res.body.data.user.should.have.property("description");
                        res.body.data.user.should.have.property("profile_picture");
                        res.body.data.user.should.have.property("language");
                        next(null);
                    });
            }
        ], function (err) {
            done();
        });
    });

});
