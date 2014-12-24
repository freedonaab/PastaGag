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

    it('A post you just created should have only one upvote', function (done) {
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
            post.should.have.property('votes');
            post.votes.should.have.property('hotness');
            post.votes.hotness.should.be.greaterThan(0);
            post.votes.should.have.property('score');
            post.votes.score.should.have.property('up', 1);
            post.votes.score.should.have.property('down', 0);
            post.votes.score.should.have.property('total', 1);
            done();
        });
    });


    it('An user reate a post then downvote it, should have a score of 0', function (done) {
        var userId = null;
        var postId = null;
        async.waterfall([
            testUtils.createUser(config, {
                email: "mouloud1@hotmail.fr",
                username: "kebab94",
                password: "wallah123"
            }),
            function (res, next) {
                userId = res.body.data.user._id;
                testUtils.createPostWithErrorChecking(config, {
                    title: "Watch this adorable little puppy die in fire",
                    content: "http://127.0.0.1:8080/fake/images/success/123456.jpg",
                    author_id: userId
                })(next);
            },
            function (post, next) {
                postId = post._id;
                testUtils.post(config, '/posts/'+postId+'/votes/down', { user_id: userId })(next);
            },
            function (res, next) {
                res.should.have.property('body');
                res.body.should.have.property('metadata');
                res.body.should.have.property('data');
                res.body.metadata.should.have.property('success', true);
                res.body.metadata.should.have.property('error', null);
                res.body.metadata.should.have.property('statusCode', 200);
                testUtils.getPostWithErrorChecking(config, postId)(next);
            }
        ], function (err, post) {
            should.not.exist(err);
            should.exist(post);
            post.should.have.property("title", "Watch this adorable little puppy die in fire");
            post.should.have.property("content", "http://127.0.0.1:8080/fake/images/success/123456.jpg");
            post.should.have.property("content_type", "image");
            post.should.have.property('votes');
            post.votes.should.have.property('hotness');
            post.votes.hotness.should.be.greaterThan(0);
            post.votes.should.have.property('score');
            post.votes.score.should.have.property('up', 0);
            post.votes.score.should.have.property('down', 1);
            post.votes.score.should.have.property('total', -1);
            done();
        });
    });


    it('An user shouldn\'t be able to upvote his post', function (done) {
        var userId = null;
        var postId = null;
        async.waterfall([
            testUtils.createUser(config, {
                email: "mouloud1@hotmail.fr",
                username: "kebab94",
                password: "wallah123"
            }),
            function (res, next) {
                userId = res.body.data.user._id;
                testUtils.createPostWithErrorChecking(config, {
                    title: "Watch this adorable little puppy die in fire",
                    content: "http://127.0.0.1:8080/fake/images/success/123456.jpg",
                    author_id: userId
                })(next);
            },
            function (post, next) {
                postId = post._id;
                testUtils.post(config, '/posts/'+postId+'/votes/up', { user_id: userId })(next);
            },
            function (res, next) {
                res.should.have.property('body');
                res.body.should.have.property('metadata');
                res.body.should.have.property('data');
                res.body.metadata.should.have.property('success', false);
                res.body.metadata.should.have.property('error');
                res.body.metadata.should.have.property('statusCode', 400);
                testUtils.getPostWithErrorChecking(config, postId)(next);
            }
        ], function (err, post) {
            should.not.exist(err);
            should.exist(post);
            post.should.have.property("title", "Watch this adorable little puppy die in fire");
            post.should.have.property("content", "http://127.0.0.1:8080/fake/images/success/123456.jpg");
            post.should.have.property("content_type", "image");
            post.should.have.property('votes');
            post.votes.should.have.property('hotness');
            post.votes.hotness.should.be.greaterThan(0);
            post.votes.should.have.property('score');
            post.votes.score.should.have.property('up', 1);
            post.votes.score.should.have.property('down', 0);
            post.votes.score.should.have.property('total', 1);
            done();
        });
    });


    it('An user should be able to upvote the post of another user', function (done) {
        var user1Id = null;
        var user2Id = null;
        var postId = null;
        async.waterfall([
            testUtils.createUsers(config, [{
                email: "postcreator@hotmail.fr",
                username: "postcreator",
                password: "wallah123"
            },{
                email: "postvoter@hotmail.fr",
                username: "postvoter",
                password: "tamerdejonathan"
            }]),
            function (userIds, next) {
                user1Id = userIds[0];
                user2Id = userIds[1];
                testUtils.createPostWithErrorChecking(config, {
                    title: "Watch this adorable little puppy die in fire",
                    content: "http://127.0.0.1:8080/fake/images/success/123456.jpg",
                    author_id: user1Id
                })(next);
            },
            function (post, next) {
                postId = post._id;
                testUtils.post(config, '/posts/'+postId+'/votes/up', { user_id: user2Id })(next);
            },
            function (res, next) {
                res.should.have.property('body');
                res.body.should.have.property('metadata');
                res.body.should.have.property('data');
                res.body.metadata.should.have.property('success', true);
                res.body.metadata.should.have.property('error', null);
                res.body.metadata.should.have.property('statusCode', 200);
                testUtils.getPostWithErrorChecking(config, postId)(next);
            }
        ], function (err, post) {
            should.not.exist(err);
            should.exist(post);
            post.should.have.property("title", "Watch this adorable little puppy die in fire");
            post.should.have.property("content", "http://127.0.0.1:8080/fake/images/success/123456.jpg");
            post.should.have.property("content_type", "image");
            post.should.have.property('votes');
            post.votes.should.have.property('hotness');
            post.votes.hotness.should.be.greaterThan(0);
            post.votes.should.have.property('score');
            post.votes.score.should.have.property('up', 2);
            post.votes.score.should.have.property('down', 0);
            post.votes.score.should.have.property('total', 2);
            done();
        });
    });


    it('An user should be able to downvote the post of another user', function (done) {
        var user1Id = null;
        var user2Id = null;
        var postId = null;
        async.waterfall([
            testUtils.createUsers(config, [{
                email: "postcreator@hotmail.fr",
                username: "postcreator",
                password: "wallah123"
            },{
                email: "postvoter@hotmail.fr",
                username: "postvoter",
                password: "tamerdejonathan"
            }]),
            function (userIds, next) {
                user1Id = userIds[0];
                user2Id = userIds[1];
                testUtils.createPostWithErrorChecking(config, {
                    title: "Watch this adorable little puppy die in fire",
                    content: "http://127.0.0.1:8080/fake/images/success/123456.jpg",
                    author_id: user1Id
                })(next);
            },
            function (post, next) {
                postId = post._id;
                testUtils.post(config, '/posts/'+postId+'/votes/down', { user_id: user2Id })(next);
            },
            function (res, next) {
                res.should.have.property('body');
                res.body.should.have.property('metadata');
                res.body.should.have.property('data');
                res.body.metadata.should.have.property('success', true);
                res.body.metadata.should.have.property('error', null);
                res.body.metadata.should.have.property('statusCode', 200);
                testUtils.getPostWithErrorChecking(config, postId)(next);
            }
        ], function (err, post) {
            should.not.exist(err);
            should.exist(post);
            post.should.have.property("title", "Watch this adorable little puppy die in fire");
            post.should.have.property("content", "http://127.0.0.1:8080/fake/images/success/123456.jpg");
            post.should.have.property("content_type", "image");
            post.should.have.property('votes');
            post.votes.should.have.property('hotness');
            post.votes.hotness.should.be.greaterThan(0);
            post.votes.should.have.property('score');
            post.votes.score.should.have.property('up', 1);
            post.votes.score.should.have.property('down', 1);
            post.votes.score.should.have.property('total', 0);
            done();
        });
    });

});
