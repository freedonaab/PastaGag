/*global describe:false, it:false, beforeEach:false, afterEach:false*/

'use strict';


var kraken = require('kraken-js'),
    express = require('express'),
    request = require('supertest');

var db = require("../../lib/database");
var mongoose = require('mongoose');
var async = require('async');
var should = require('should');
var testUtils = require('../../lib/test');


var mapCookies = function (cookies) {
    return cookies.map(function (r) {
        return r.replace("; path=/; httponly", "");
    }).join("; ");
};


describe('/posts', function () {

    var config = {};

    beforeEach(testUtils.beforeEach(config));

    afterEach(testUtils.afterEach(config));

    it('should list all posts', function (done) {
        request(config.mock)
            .get('/posts')
            .expect(200)
            .end(function (err, res) {
                done(err);
            });
    });

    it('should create post', function (done) {
        async.waterfall([
            testUtils.createUser(config, {
                email: "mouloud1@hotmail.fr",
                username: "kebab94",
                password: "wallah123"
            }),
            function (res, next) {
                var userId = res.body.data.user._id;
               // console.log(res.headers);
                request(config.mock)
                    .post('/posts')
                    .set('Cookie', testUtils.mapCookies(config.res.headers['set-cookie']))
                    .send({
                        _csrf: config.res.body._csrf,
                        metadata: {},
                        data: {
                            post: {
                                title: "Watch this adorable little puppy die in fire",
                                content: "http://127.0.0.1:8080/fake/images/success/123456.jpg",
                                content_type: "image",
                                author_id: userId
                            }
                        }
                    })
                    .expect(200, function (err, res) {
                        //console.log("wat", res.body, res.text);
                        should.exist(res);
                        res.should.have.property("body");
                        res.body.should.have.property("metadata");
                        res.body.should.have.property("data");
                        res.body.metadata.should.have.property("success", true);
                        res.body.metadata.should.have.property("error", null);
                        res.body.metadata.should.have.property("statusCode", 200);
                        res.body.data.should.have.property("post");
                        res.body.data.post.should.have.property("_id");
                        res.body.data.post.should.have.property("title", "Watch this adorable little puppy die in fire");
                        res.body.data.post.should.have.property("content", "http://127.0.0.1:8080/fake/images/success/123456.jpg");
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


    it('should detect youtube videos', function (done) {
        async.waterfall([
            testUtils.createUser(config, {
                email: "mouloud1@hotmail.fr",
                username: "kebab94",
                password: "wallah123"
            }),
            function (res, next) {
                var userId = res.body.data.user._id;
                // console.log(res.headers);
                request(config.mock)
                    .post('/posts')
                    .set('Cookie', testUtils.mapCookies(config.res.headers['set-cookie']))
                    .send({
                        _csrf: config.res.body._csrf,
                        metadata: {},
                        data: {
                            post: {
                                title: "Game of Thrones Saison 5 Episode 1",
                                content: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                                author_id: userId
                            }
                        }
                    })
                    .expect(200, function (err, res) {
                        //console.log("wat", res.body, res.text);
                        should.exist(res);
                        res.should.have.property("body");
                        res.body.should.have.property("metadata");
                        res.body.should.have.property("data");
                        res.body.metadata.should.have.property("success", true);
                        res.body.data.should.have.property("post");
                        res.body.data.post.should.have.property("_id");
                        res.body.data.post.should.have.property("title", "Game of Thrones Saison 5 Episode 1");
                        res.body.data.post.should.have.property("content", "https://www.youtube.com/watch?v=dQw4w9WgXcQ");
                        res.body.data.post.should.have.property("content_type", "video");
                        res.body.data.post.should.have.property("created_at");
                        res.body.data.post.should.have.property("updated_at");
                        next(null);
                    });
            }
        ], function (err) {
            done();
        });
    });


    it('should detect invalid url', function (done) {
        async.waterfall([
            testUtils.createUser(config, {
                email: "mouloud1@hotmail.fr",
                username: "kebab94",
                password: "wallah123"
            }),
            function (res, next) {
                var userId = res.body.data.user._id;
                // console.log(res.headers);
                request(config.mock)
                    .post('/posts')
                    .set('Cookie', testUtils.mapCookies(config.res.headers['set-cookie']))
                    .send({
                        _csrf: config.res.body._csrf,
                        metadata: {},
                        data: {
                            post: {
                                title: "I swear! this a really valid url!",
                                content: "http://thisurldoesnotexist.com/5644854.jpg",
                                author_id: userId
                            }
                        }
                    })
                    .expect(400, function (err, res) {
                        //console.log("wat", res.body, res.text);
                        should.exist(res);
                        res.should.have.property("body");
                        res.body.should.have.property("metadata");
                        res.body.should.have.property("data", null);
                        res.body.metadata.should.have.property("success", false);
                        res.body.metadata.should.have.property("error");
                        res.body.metadata.should.have.property("statusCode", 400);
                        next(null);
                    });
            }
        ], function (err) {
            done();
        });
    });

    it('should detect youtube 404', function (done) {
        async.waterfall([
            testUtils.createUser(config, {
                email: "mouloud1@hotmail.fr",
                username: "kebab94",
                password: "wallah123"
            }),
            function (res, next) {
                var userId = res.body.data.user._id;
                // console.log(res.headers);
                request(config.mock)
                    .post('/posts')
                    .set('Cookie', testUtils.mapCookies(config.res.headers['set-cookie']))
                    .send({
                        _csrf: config.res.body._csrf,
                        metadata: {},
                        data: {
                            post: {
                                title: "Game of Thrones Saison 5 Episode 1",
                                //TODO: uncomment this
                                //content: "https://www.youtube.com/watch?v=dQw4w945sd4f8sdf4WgXcQ",
                                content: "https://www.youtube.com/watch?vlol=dQw4w945sd4f8sdf4WgXcQ",
                                author_id: userId
                            }
                        }
                    })
                    .expect(400, function (err, res) {
                        //console.log("wat", res.body, res.text);
                        should.exist(res);
                        res.should.have.property("body");
                        res.body.should.have.property("metadata");
                        res.body.should.have.property("data", null);
                        res.body.metadata.should.have.property("success", false);
                        res.body.metadata.should.have.property("error");
                        res.body.metadata.should.have.property("statusCode", 400);
                        next(null);
                    });
            }
        ], function (err) {
            done();
        });
    });

    it('should detect invalid youtube url (without v params)', function (done) {
        async.waterfall([
            testUtils.createUser(config, {
                email: "mouloud1@hotmail.fr",
                username: "kebab94",
                password: "wallah123"
            }),
             function (res, next) {
                var userId = res.body.data.user._id;
                // console.log(res.headers);
                request(config.mock)
                    .post('/posts')
                    .set('Cookie', testUtils.mapCookies(config.res.headers['set-cookie']))
                    .send({
                        _csrf: config.res.body._csrf,
                        metadata: {},
                        data: {
                            post: {
                                title: "Game of Thrones Saison 5 Episode 1",
                                content: "https://www.youtube.com/watch?vlol=dQw4w945sd4f8sdf4WgXcQ",
                                author_id: userId
                            }
                        }
                    })
                    .expect(400, function (err, res) {
                        //console.log("wat", res.body, res.text);
                        should.exist(res);
                        res.should.have.property("body");
                        res.body.should.have.property("metadata");
                        res.body.should.have.property("data", null);
                        res.body.metadata.should.have.property("success", false);
                        res.body.metadata.should.have.property("error");
                        res.body.metadata.should.have.property("statusCode", 400);
                        next(null);
                    });
            }
        ], function (err) {
            done();
        });
    });


    /*votes*/
});
