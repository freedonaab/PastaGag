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
                testUtils.createPostWithErrorChecking(config, {
                    title: "Watch this adorable little puppy die in fire",
                    content: "http://127.0.0.1:8080/fake/images/success/123456.jpg",
                    author_id: userId
                })(next);
            }
        ], function (err, post) {
            should.not.exist(err);
            should.exist(post);
            post.should.have.property("title", "Watch this adorable little puppy die in fire");
            post.should.have.property("content", "http://127.0.0.1:8080/fake/images/success/123456.jpg");
            post.should.have.property("content_type", "image");
            done();
        });
    });


    it('should detect image type - PNG', function (done) {
        async.waterfall([
            testUtils.createUser(config, {
                email: "mouloud1@hotmail.fr",
                username: "kebab94",
                password: "wallah123"
            }),
            function (res, next) {
                var userId = res.body.data.user._id;
                testUtils.createPostWithErrorChecking(config, {
                    title: "Watch this adorable little puppy die in fire",
                    content: "http://127.0.0.1:8080/fake/images/success/123456.png",
                    author_id: userId
                })(next);
            }
        ], function (err, post) {
            should.not.exist(err);
            should.exist(post);
            post.should.have.property("title", "Watch this adorable little puppy die in fire");
            post.should.have.property("content", "http://127.0.0.1:8080/fake/images/success/123456.png");
            post.should.have.property("content_type", "image");
            done();
        });
    });

    it('should detect image type - GIF', function (done) {
        async.waterfall([
            testUtils.createUser(config, {
                email: "mouloud1@hotmail.fr",
                username: "kebab94",
                password: "wallah123"
            }),
            function (res, next) {
                var userId = res.body.data.user._id;
                testUtils.createPostWithErrorChecking(config, {
                    title: "Watch this adorable little puppy die in fire",
                    content: "http://127.0.0.1:8080/fake/images/success/123456.gif",
                    author_id: userId
                })(next);
            }
        ], function (err, post) {
            should.not.exist(err);
            should.exist(post);
            post.should.have.property("title", "Watch this adorable little puppy die in fire");
            post.should.have.property("content", "http://127.0.0.1:8080/fake/images/success/123456.gif");
            post.should.have.property("content_type", "image");
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
                testUtils.createPostWithErrorChecking(config, {
                    title: "Game of Thrones Saison 5 Episode 1",
                    content: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                    author_id: userId
                })(next);
            }
        ], function (err, post) {
            should.not.exist(err);
            should.exist(post);
            post.should.have.property("title", "Game of Thrones Saison 5 Episode 1");
            post.should.have.property("content", "https://www.youtube.com/watch?v=dQw4w9WgXcQ");
            post.should.have.property("content_type", "video");
            done();
        });
    });

    it('should be able to GET a post we just created', function (done) {
        async.waterfall([
            testUtils.createUser(config, {
                email: "mouloud1@hotmail.fr",
                username: "kebab94",
                password: "wallah123"
            }),
            function (res, next) {
                var userId = res.body.data.user._id;
                testUtils.createPostWithErrorChecking(config, {
                    title: "Watch this adorable little puppy die in fire",
                    content: "http://127.0.0.1:8080/fake/images/success/123456.gif",
                    author_id: userId
                })(next);
            },
            function (post, next) {
                testUtils.getPostWithErrorChecking(config, post._id)(next);
            }
        ], function (err, post) {
            should.not.exist(err);
            should.exist(post);
            post.should.have.property("title", "Watch this adorable little puppy die in fire");
            post.should.have.property("content", "http://127.0.0.1:8080/fake/images/success/123456.gif");
            post.should.have.property("content_type", "image");
            done();
        });
    });

});
