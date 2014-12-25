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

    it('GET a post should not retrieve all fields', function (done) {
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
            post.should.have.property('author_id');
            post.should.have.property('status');
            post.should.have.property('votes');
            post.votes.should.have.property('hotness');
            post.votes.should.have.property('score');
            post.votes.should.not.have.property('ups');
            post.votes.should.not.have.property('downs');
            post.votes.score.should.have.property('down');
            post.votes.score.should.have.property('up');
            post.votes.score.should.have.property('total');
            post.should.have.property('comments');
            post.should.have.property('updated_at');
            post.should.have.property('created_at');
            done();
        });
    });

    it('when retrieving a list of posts, not all fields should be present', function (done) {
        async.waterfall([
            testUtils.createUser(config, {
                email: "mouloud1@hotmail.fr",
                username: "kebab94",
                password: "wallah123"
            }),
            function (res, next) {
                var userId = res.body.data.user._id;
                testUtils.createPosts(config, [{
                    title: "Watch this adorable little puppy die in fire",
                    content: "http://127.0.0.1:8080/fake/images/success/123456.jpg",
                    author_id: userId
                },{
                    title: "Found this in my toilets this morning",
                    content: "http://127.0.0.1:8080/fake/images/success/1544646.jpg",
                    author_id: userId
                },{
                    title: "You will never guess how this little cat did that",
                    content: "http://127.0.0.1:8080/fake/images/success/56465.jpg",
                    author_id: userId
                }])(next);
            },
            function (postIds, next) {
                testUtils.get(config, '/posts')(next);
            }
        ], function (err, res) {
            should.not.exist(err);
            should.exist(res);
            res.should.have.property('body');
            res.body.should.have.property('metadata');
            res.body.should.have.property('data');
            res.body.metadata.should.have.property('success', true);
            res.body.metadata.should.have.property('error', null);
            res.body.metadata.should.have.property('statusCode', 200);
            res.body.data.should.have.property('posts');
            res.body.data.posts.should.be.an.Array;
            res.body.data.posts.should.have.length(3);
            for (var i = 0; i < res.body.data.posts.length; ++i) {
                res.body.data.posts[i].should.have.property('title');
                res.body.data.posts[i].should.have.property('content');
                res.body.data.posts[i].should.have.property('content_type');
                res.body.data.posts[i].should.have.property('author_id');
                res.body.data.posts[i].should.have.property('status');
                res.body.data.posts[i].should.have.property('votes');
                res.body.data.posts[i].votes.should.have.property('hotness');
                res.body.data.posts[i].votes.should.have.property('score');
                res.body.data.posts[i].votes.should.not.have.property('ups');
                res.body.data.posts[i].votes.should.not.have.property('downs');
                res.body.data.posts[i].votes.score.should.have.property('down');
                res.body.data.posts[i].votes.score.should.have.property('up');
                res.body.data.posts[i].votes.score.should.have.property('total');
                res.body.data.posts[i].should.not.have.property('comments');
                res.body.data.posts[i].should.have.property('updated_at');
                res.body.data.posts[i].should.have.property('created_at');
            }
            done();
        });
    });


});
