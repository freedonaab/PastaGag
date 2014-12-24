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

describe('/posts', function () {

    var config = {};

    beforeEach(testUtils.beforeEach(config));

    afterEach(testUtils.afterEach(config));


    it('should detect missing title', function (done) {
        async.waterfall([
            testUtils.createUser(config, {
                email: "mouloud1@hotmail.fr",
                username: "kebab94",
                password: "wallah123"
            }),
            function (res, next) {
                var userId = res.body.data.user._id;
                testUtils.createPost(config, {
                    content: "http://127.0.0.1:8080/fake/images/success/123456.jpg",
                    author_id: userId
                })(next);
            }
        ], function (err, res) {
            should.exist(res);
            res.should.have.property("body");
            res.body.should.have.property("metadata");
            res.body.should.have.property("data", null);
            res.body.metadata.should.have.property("success", false);
            res.body.metadata.should.have.property("error");
            res.body.metadata.should.have.property("statusCode", 400);
            done();
        });
    });

    it('should detect missing content', function (done) {
        async.waterfall([
            testUtils.createUser(config, {
                email: "mouloud1@hotmail.fr",
                username: "kebab94",
                password: "wallah123"
            }),
            function (res, next) {
                var userId = res.body.data.user._id;
                testUtils.createPost(config, {
                    title: 'a very cool post without content',
                    author_id: userId
                })(next);
            }
        ], function (err, res) {
            should.exist(res);
            res.should.have.property("body");
            res.body.should.have.property("metadata");
            res.body.should.have.property("data", null);
            res.body.metadata.should.have.property("success", false);
            res.body.metadata.should.have.property("error");
            res.body.metadata.should.have.property("statusCode", 400);
            done();
        });
    });

    it('should detect empty title', function (done) {
        async.waterfall([
            testUtils.createUser(config, {
                email: "mouloud1@hotmail.fr",
                username: "kebab94",
                password: "wallah123"
            }),
            function (res, next) {
                var userId = res.body.data.user._id;
                testUtils.createPost(config, {
                    title: '',
                    content: "http://127.0.0.1:8080/fake/images/success/123456.jpg",
                    author_id: userId
                })(next);
            }
        ], function (err, res) {
            should.exist(res);
            res.should.have.property("body");
            res.body.should.have.property("metadata");
            res.body.should.have.property("data", null);
            res.body.metadata.should.have.property("success", false);
            res.body.metadata.should.have.property("error");
            res.body.metadata.should.have.property("statusCode", 400);
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
                testUtils.createPost(config, {
                    title: "I swear! this a really valid url!",
                    content: "http://thisurldoesnotexist.com/5644854.jpg",
                    author_id: userId
                })(next);
            }
        ], function (err, res) {
            should.exist(res);
            res.should.have.property("body");
            res.body.should.have.property("metadata");
            res.body.should.have.property("data", null);
            res.body.metadata.should.have.property("success", false);
            res.body.metadata.should.have.property("error");
            res.body.metadata.should.have.property("statusCode", 400);
            done();
        });
    });

    it('should detect unsupported file extensions', function (done) {

        async.waterfall([
            testUtils.createUser(config, {
                email: "mouloud1@hotmail.fr",
                username: "kebab94",
                password: "wallah123"
            }),
            function (res, next) {
                var userId = res.body.data.user._id;
                testUtils.createPost(config, {
                    title: "Darude - Sandstorm",
                    content: "http://localhost:8080/5644854.mp3",
                    author_id: userId
                })(next);
            }
        ], function (err, res) {
            should.exist(res);
            res.should.have.property("body");
            res.body.should.have.property("metadata");
            res.body.should.have.property("data", null);
            res.body.metadata.should.have.property("success", false);
            res.body.metadata.should.have.property("error");
            res.body.metadata.should.have.property("statusCode", 400);
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
                testUtils.createPost(config, {
                    title: "Game of Thrones Saison 5 Episode 1",
                    //TODO: uncomment this
                    //content: "https://www.youtube.com/watch?v=dQw4w945sd4f8sdf4WgXcQ",
                    content: "https://www.youtube.com/watch?vlol=dQw4w945sd4f8sdf4WgXcQ",
                    author_id: userId
                })(next);
            }
        ], function (err, res) {
            should.exist(res);
            res.should.have.property("body");
            res.body.should.have.property("metadata");
            res.body.should.have.property("data", null);
            res.body.metadata.should.have.property("success", false);
            res.body.metadata.should.have.property("error");
            res.body.metadata.should.have.property("statusCode", 400);
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
                testUtils.createPost(config, {
                    title: "Game of Thrones Saison 5 Episode 1",
                    content: "https://www.youtube.com/watch?vlol=dQw4w945sd4f8sdf4WgXcQ",
                    author_id: userId
                })(next);
            }
        ], function (err, res) {
            should.exist(res);
            res.should.have.property("body");
            res.body.should.have.property("metadata");
            res.body.should.have.property("data", null);
            res.body.metadata.should.have.property("success", false);
            res.body.metadata.should.have.property("error");
            res.body.metadata.should.have.property("statusCode", 400);
            done();
        });
    });

    it('GET a post that doesnt exist should 404', function (done) {

        async.waterfall([
            testUtils.createUser(config, {
                email: "mouloud1@hotmail.fr",
                username: "kebab94",
                password: "wallah123"
            }),
            function (post, next) {
                testUtils.getPost(config, '549ac4656ddf2dec20065754')(next);
            }
        ], function (err, res) {
            should.exist(res);
            res.should.have.property("body");
            res.body.should.have.property("metadata");
            res.body.should.have.property("data", null);
            res.body.metadata.should.have.property("success", false);
            res.body.metadata.should.have.property("error");
            res.body.metadata.should.have.property("statusCode", 404);
            done();
        });
    });


});
