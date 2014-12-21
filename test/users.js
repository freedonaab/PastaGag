/*global describe:false, it:false, beforeEach:false, afterEach:false*/

'use strict';


var kraken = require('kraken-js');
var express = require('express');
var request = require('supertest');
var should = require('should');
var async = require('async');
var options = require("../lib/spec");
var db = require("../lib/database");


var mapCookies = function (cookies) {
    return cookies.map(function (r) {
        return r.replace("; path=/; httponly", "");
    }).join("; ");
};

describe('users', function () {

    var app, mock;


    beforeEach(function (done) {
        app = express();
        app.on('start', done);
        app.use(kraken({
            basedir: process.cwd(),
            onconfig: function (config, next) {
                db.config(config.get('database'));
                next(null, config);
            }
        }));

        mock = app.listen(1337);

    });


    afterEach(function (done) {
        mock.close(done);
    });


    it('should create user', function (done) {

        var _csrfToken = null;

        async.waterfall([
            function (next) {
                request(mock)
                    .get('/csrf')
                    .end(function (err, res) {

                        should.exist(res);
                        res.should.have.property("body");
                        res.body.should.have.property("_csrf");

                        next(null, res);
                    });
            },
            function (res, next) {
                request(mock)
                    .post('/users')
                    .set('Cookie', mapCookies(res.headers['set-cookie']))
                    .send({
                        _csrf: res.body._csrf,
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
