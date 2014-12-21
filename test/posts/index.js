/*global describe:false, it:false, beforeEach:false, afterEach:false*/

'use strict';


var kraken = require('kraken-js'),
    express = require('express'),
    request = require('supertest');

var db = require("../../lib/database");
var mongoose = require('mongoose');
var async = require('async');
var should = require('should');


var mapCookies = function (cookies) {
    return cookies.map(function (r) {
        return r.replace("; path=/; httponly", "");
    }).join("; ");
};


describe('/posts', function () {

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
        mongoose.disconnect();
    });


    it('should list all posts', function (done) {
        request(mock)
            .get('/posts')
            .expect(200)
            .end(function (err, res) {
                done(err);
            });
    });

    it('should create post', function (done) {

        var _csrfToken = null;

        async.waterfall([
            function (next) {
                request(mock)
                    .get('/csrf')
                    .end(function (err, res) {

                        next(null, res);
                    });
            },
            function (res, next) {
                //console.log(res.headers);
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
                        next(null, res);
                    })
            },
            function (res, next) {
                request(mock)
                    .get('/csrf')
                    .end(function (err, _res) {
                        _res.body.userId = res.body.data.user._id;
                        next(null, _res);
                    });
            },
            function (res, next) {
                var userId = res.body.userId;
               // console.log(res.headers);
                request(mock)
                    .post('/posts')
                    .set('Cookie', mapCookies(res.headers['set-cookie']))
                    .send({
                        _csrf: res.body._csrf,
                        metadata: {},
                        data: {
                            post: {
                                title: "Watch this adorable little puppy die in fire",
                                content: "http://9gag/56546",
                                content_type: "image",
                                author_id: userId
                            }
                        }
                    })
                    .expect(200, function (err, res) {
                        console.log("wat", res.body, res.text);
                        should.exist(res);
                        res.should.have.property("body");
                        res.body.should.have.property("metadata");
                        res.body.should.have.property("data");
                        res.body.metadata.should.have.property("success", true);
                        res.body.metadata.should.have.property("error", null);
                        res.body.metadata.should.have.property("statusCode", 200);
                        res.body.data.should.have.property("post");
                        res.body.data.post.should.have.property("title", "Watch this adorable little puppy die in fire");
                        res.body.data.post.should.have.property("content", "http://9gag/56546");
                        res.body.data.post.should.have.property("content_type", "image");
                        res.body.data.post.should.have.property("created_at");
                        res.body.data.post.should.have.property("updated_at");
                        next(null);
                    });
            }
        ], function (err) {
            done();
        });
    });


});
