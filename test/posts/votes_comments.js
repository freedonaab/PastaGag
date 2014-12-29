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

    it('A comment you just ade should have one upvote', function (done) {
        var post = null;
        var userId = null;
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
            function (_post, next) {
                post = _post;
                testUtils.postWithErrorChecking(config, '/posts/'+post._id+'/comments', {
                    author_id: userId,
                    message: 'my first comment'
                })(next);
            },
            function (res, next) {
                should.exist(res);
                res.should.have.property('body');
                res.body.should.have.property('metadata');
                res.body.should.have.property('data');
                res.body.metadata.should.have.property('success', true);
                res.body.metadata.should.have.property('error', null);
                res.body.metadata.should.have.property('statusCode', 200);
                res.body.data.should.have.property('comment');
                res.body.data.comment.should.have.property('_id', '0');
                testUtils.getPostWithErrorChecking(config, post._id)(next);
                //testUtils.post('/posts/'+post._id+'/comments/0/votes/');
            }
        ], function (err, post) {
            should.not.exist(err);
            should.exist(post);
            post.should.have.property('comments');
            post.comments.should.be.an.Array;
            post.comments.should.have.length(1);
            post.comments[0].should.have.property('status', 'ok');
            post.comments[0].should.have.property('_id', '0');
            post.comments[0].should.have.property('message', 'my first comment');
            post.comments[0].should.have.property('author');
            post.comments[0].author.should.have.property('_id', userId);
            post.comments[0].author.should.have.property('username', 'kebab94');
            post.comments[0].should.have.property('votes');
            post.comments[0].votes.should.have.property('hotness');
            post.comments[0].votes.hotness.should.be.greaterThan(0);
            post.comments[0].votes.should.have.property('score');
            post.comments[0].votes.should.not.have.property('ups');
            post.comments[0].votes.should.not.have.property('downs');
            post.comments[0].votes.score.should.have.property('up', 1);
            post.comments[0].votes.score.should.have.property('down', 0);
            post.comments[0].votes.score.should.have.property('up', 1);
            post.comments[0].votes.score.should.have.property('total', 1);
            post.comments[0].should.have.property('replies');
            post.comments[0].replies.should.have.be.an.Array;
            post.comments[0].replies.should.have.have.length(0);
            post.comments[0].should.have.property('created_at');
            post.comments[0].should.have.property('updated_at');
            done();
        });
    });


    it('An user should be able to downvote his own comment, should have a score of 0', function (done) {
        var post = null;
        var userId = null;
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
            function (_post, next) {
                post = _post;
                testUtils.postWithErrorChecking(config, '/posts/'+post._id+'/comments', {
                    author_id: userId,
                    message: 'my first comment'
                })(next);
            },
            function (res, next) {
                should.exist(res);
                res.should.have.property('body');
                res.body.should.have.property('metadata');
                res.body.should.have.property('data');
                res.body.metadata.should.have.property('success', true);
                res.body.metadata.should.have.property('error', null);
                res.body.metadata.should.have.property('statusCode', 200);
                res.body.data.should.have.property('comment');
                res.body.data.comment.should.have.property('_id', '0');
                testUtils.post(config, '/posts/'+post._id+'/comments/0/votes/down', {
                    user_id: userId
                })(next);
            },
            function (res, next) {
                should.exist(res);
                res.should.have.property('body');
                res.body.should.have.property('metadata');
                res.body.should.have.property('data');
                res.body.metadata.should.have.property('success', true);
                res.body.metadata.should.have.property('error', null);
                res.body.metadata.should.have.property('statusCode', 200);
                testUtils.getPostWithErrorChecking(config, post._id)(next);
            }
        ], function (err, post) {
            should.not.exist(err);
            should.exist(post);
            post.should.have.property('comments');
            post.comments.should.be.an.Array;
            post.comments.should.have.length(1);
            post.comments[0].should.have.property('_id', '0');
            post.comments[0].should.have.property('votes');
            post.comments[0].votes.should.have.property('hotness');
            post.comments[0].votes.hotness.should.be.greaterThan(0);
            post.comments[0].votes.should.have.property('score');
            post.comments[0].votes.should.not.have.property('ups');
            post.comments[0].votes.should.not.have.property('downs');
            post.comments[0].votes.score.should.have.property('up', 0);
            post.comments[0].votes.score.should.have.property('down', 1);
            post.comments[0].votes.score.should.have.property('total', -1);
            done();
        });
    });


    it('An user shouldnt be able to upvote his own comment', function (done) {
        var post = null;
        var userId = null;
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
            function (_post, next) {
                post = _post;
                testUtils.postWithErrorChecking(config, '/posts/'+post._id+'/comments', {
                    author_id: userId,
                    message: 'my first comment'
                })(next);
            },
            function (res, next) {
                should.exist(res);
                res.should.have.property('body');
                res.body.should.have.property('metadata');
                res.body.should.have.property('data');
                res.body.metadata.should.have.property('success', true);
                res.body.metadata.should.have.property('error', null);
                res.body.metadata.should.have.property('statusCode', 200);
                res.body.data.should.have.property('comment');
                res.body.data.comment.should.have.property('_id', '0');
                testUtils.post(config, '/posts/'+post._id+'/comments/0/votes/up', {
                    user_id: userId
                })(next);
            },
            function (res, next) {
                should.exist(res);
                res.should.have.property('body');
                res.body.should.have.property('metadata');
                res.body.should.have.property('data');
                res.body.metadata.should.have.property('success', false);
                res.body.metadata.should.have.property('error');
                res.body.metadata.should.have.property('statusCode', 400);
                testUtils.getPostWithErrorChecking(config, post._id)(next);
            }
        ], function (err, post) {
            should.not.exist(err);
            should.exist(post);
            post.should.have.property('comments');
            post.comments.should.be.an.Array;
            post.comments.should.have.length(1);
            post.comments[0].should.have.property('_id', '0');
            post.comments[0].should.have.property('votes');
            post.comments[0].votes.should.have.property('hotness');
            post.comments[0].votes.hotness.should.be.greaterThan(0);
            post.comments[0].votes.should.have.property('score');
            post.comments[0].votes.should.not.have.property('ups');
            post.comments[0].votes.should.not.have.property('downs');
            post.comments[0].votes.score.should.have.property('up', 0);
            post.comments[0].votes.score.should.have.property('down', 1);
            post.comments[0].votes.score.should.have.property('total', -1);
            done();
        });
    });


    it('An user should be able to upvote the comment of another user', function (done) {
        var post = null;
        var user1Id = null;
        var user2Id = null;
        async.waterfall([
            testUtils.createUsers(config, [{
                email: "mouloud1@hotmail.fr",
                username: "kebab94",
                password: "wallah123"
            }, {
                email: "gerard@carameil.be",
                username: "moulefrite22",
                password: "outusorsoujtesors"
            }]),
            function (userIds, next) {
                user1Id = userIds[0];
                user1Id = userIds[1];
                testUtils.createPostWithErrorChecking(config, {
                    title: "Watch this adorable little puppy die in fire",
                    content: "http://127.0.0.1:8080/fake/images/success/123456.jpg",
                    author_id: user1Id
                })(next);
            },
            function (_post, next) {
                post = _post;
                testUtils.postWithErrorChecking(config, '/posts/'+post._id+'/comments', {
                    author_id: user1Id,
                    message: 'my first comment'
                })(next);
            },
            function (res, next) {
                should.exist(res);
                res.should.have.property('body');
                res.body.should.have.property('metadata');
                res.body.should.have.property('data');
                res.body.metadata.should.have.property('success', true);
                res.body.metadata.should.have.property('error', null);
                res.body.metadata.should.have.property('statusCode', 200);
                res.body.data.should.have.property('comment');
                res.body.data.comment.should.have.property('_id', '0');
                testUtils.post(config, '/posts/'+post._id+'/comments/0/votes/up', {
                    user_id: user2Id
                })(next);
            },
            function (res, next) {
                should.exist(res);
                res.should.have.property('body');
                res.body.should.have.property('metadata');
                res.body.should.have.property('data');
                res.body.metadata.should.have.property('success', true);
                res.body.metadata.should.have.property('error', null);
                res.body.metadata.should.have.property('statusCode', 200);
                testUtils.getPostWithErrorChecking(config, post._id)(next);
            }
        ], function (err, post) {
            should.not.exist(err);
            should.exist(post);
            post.should.have.property('comments');
            post.comments.should.be.an.Array;
            post.comments.should.have.length(1);
            post.comments[0].should.have.property('_id', '0');
            post.comments[0].should.have.property('votes');
            post.comments[0].votes.should.have.property('hotness');
            post.comments[0].votes.hotness.should.be.greaterThan(0);
            post.comments[0].votes.should.have.property('score');
            post.comments[0].votes.should.not.have.property('ups');
            post.comments[0].votes.should.not.have.property('downs');
            post.comments[0].votes.score.should.have.property('up', 2);
            post.comments[0].votes.score.should.have.property('down', 0);
            post.comments[0].votes.score.should.have.property('total', 2);
            done();
        });
    });

    it('An user should be able to downvote the comment of another user', function (done) {
        var post = null;
        var user1Id = null;
        var user2Id = null;
        async.waterfall([
            testUtils.createUsers(config, [{
                email: "mouloud1@hotmail.fr",
                username: "kebab94",
                password: "wallah123"
            }, {
                email: "gerard@carameil.be",
                username: "moulefrite22",
                password: "outusorsoujtesors"
            }]),
            function (userIds, next) {
                user1Id = userIds[0];
                user1Id = userIds[1];
                testUtils.createPostWithErrorChecking(config, {
                    title: "Watch this adorable little puppy die in fire",
                    content: "http://127.0.0.1:8080/fake/images/success/123456.jpg",
                    author_id: user1Id
                })(next);
            },
            function (_post, next) {
                post = _post;
                testUtils.postWithErrorChecking(config, '/posts/'+post._id+'/comments', {
                    author_id: user1Id,
                    message: 'my first comment'
                })(next);
            },
            function (res, next) {
                should.exist(res);
                res.should.have.property('body');
                res.body.should.have.property('metadata');
                res.body.should.have.property('data');
                res.body.metadata.should.have.property('success', true);
                res.body.metadata.should.have.property('error', null);
                res.body.metadata.should.have.property('statusCode', 200);
                res.body.data.should.have.property('comment');
                res.body.data.comment.should.have.property('_id', '0');
                testUtils.post(config, '/posts/'+post._id+'/comments/0/votes/down', {
                    user_id: user2Id
                })(next);
            },
            function (res, next) {
                should.exist(res);
                res.should.have.property('body');
                res.body.should.have.property('metadata');
                res.body.should.have.property('data');
                res.body.metadata.should.have.property('success', true);
                res.body.metadata.should.have.property('error', null);
                res.body.metadata.should.have.property('statusCode', 200);
                testUtils.getPostWithErrorChecking(config, post._id)(next);
            }
        ], function (err, post) {
            should.not.exist(err);
            should.exist(post);
            post.should.have.property('comments');
            post.comments.should.be.an.Array;
            post.comments.should.have.length(1);
            post.comments[0].should.have.property('_id', '0');
            post.comments[0].should.have.property('votes');
            post.comments[0].votes.should.have.property('hotness');
            post.comments[0].votes.hotness.should.be.greaterThan(0);
            post.comments[0].votes.should.have.property('score');
            post.comments[0].votes.should.not.have.property('ups');
            post.comments[0].votes.should.not.have.property('downs');
            post.comments[0].votes.score.should.have.property('up', 1);
            post.comments[0].votes.score.should.have.property('down', 1);
            post.comments[0].votes.score.should.have.property('total', 0);
            done();
        });
    });


    it('An user shouldnt be able to upvote a comment twice', function (done) {
        var post = null;
        var user1Id = null;
        var user2Id = null;
        async.waterfall([
            testUtils.createUsers(config, [{
                email: "mouloud1@hotmail.fr",
                username: "kebab94",
                password: "wallah123"
            }, {
                email: "gerard@carameil.be",
                username: "moulefrite22",
                password: "outusorsoujtesors"
            }]),
            function (userIds, next) {
                user1Id = userIds[0];
                user1Id = userIds[1];
                testUtils.createPostWithErrorChecking(config, {
                    title: "Watch this adorable little puppy die in fire",
                    content: "http://127.0.0.1:8080/fake/images/success/123456.jpg",
                    author_id: user1Id
                })(next);
            },
            function (_post, next) {
                post = _post;
                testUtils.postWithErrorChecking(config, '/posts/'+post._id+'/comments', {
                    author_id: user1Id,
                    message: 'my first comment'
                })(next);
            },
            function (res, next) {
                should.exist(res);
                res.should.have.property('body');
                res.body.should.have.property('metadata');
                res.body.should.have.property('data');
                res.body.metadata.should.have.property('success', true);
                res.body.metadata.should.have.property('error', null);
                res.body.metadata.should.have.property('statusCode', 200);
                res.body.data.should.have.property('comment');
                res.body.data.comment.should.have.property('_id', '0');
                testUtils.post(config, '/posts/'+post._id+'/comments/0/votes/up', {
                    user_id: user2Id
                })(next);
            },
            function (res, next) {
                should.exist(res);
                res.should.have.property('body');
                res.body.should.have.property('metadata');
                res.body.should.have.property('data');
                res.body.metadata.should.have.property('success', true);
                res.body.metadata.should.have.property('error', null);
                res.body.metadata.should.have.property('statusCode', 200);
                testUtils.post(config, '/posts/'+post._id+'/comments/0/votes/up', {
                    user_id: user2Id
                })(next);
            },
            function (res, next) {
                should.exist(res);
                res.should.have.property('body');
                res.body.should.have.property('metadata');
                res.body.should.have.property('data');
                res.body.metadata.should.have.property('success', false);
                res.body.metadata.should.have.property('error');
                res.body.metadata.should.have.property('statusCode', 400);
                testUtils.getPostWithErrorChecking(config, post._id)(next);
            }

        ], function (err, post) {
            should.not.exist(err);
            should.exist(post);
            post.should.have.property('comments');
            post.comments.should.be.an.Array;
            post.comments.should.have.length(1);
            post.comments[0].should.have.property('_id', '0');
            post.comments[0].should.have.property('votes');
            post.comments[0].votes.should.have.property('hotness');
            post.comments[0].votes.hotness.should.be.greaterThan(0);
            post.comments[0].votes.should.have.property('score');
            post.comments[0].votes.should.not.have.property('ups');
            post.comments[0].votes.should.not.have.property('downs');
            post.comments[0].votes.score.should.have.property('up', 2);
            post.comments[0].votes.score.should.have.property('down', 0);
            post.comments[0].votes.score.should.have.property('total', 2);
            done();
        });
    });


    it('An user shouldnt be able to downvote a comment twice', function (done) {
        var post = null;
        var user1Id = null;
        var user2Id = null;
        async.waterfall([
            testUtils.createUsers(config, [{
                email: "mouloud1@hotmail.fr",
                username: "kebab94",
                password: "wallah123"
            }, {
                email: "gerard@carameil.be",
                username: "moulefrite22",
                password: "outusorsoujtesors"
            }]),
            function (userIds, next) {
                user1Id = userIds[0];
                user1Id = userIds[1];
                testUtils.createPostWithErrorChecking(config, {
                    title: "Watch this adorable little puppy die in fire",
                    content: "http://127.0.0.1:8080/fake/images/success/123456.jpg",
                    author_id: user1Id
                })(next);
            },
            function (_post, next) {
                post = _post;
                testUtils.postWithErrorChecking(config, '/posts/'+post._id+'/comments', {
                    author_id: user1Id,
                    message: 'my first comment'
                })(next);
            },
            function (res, next) {
                should.exist(res);
                res.should.have.property('body');
                res.body.should.have.property('metadata');
                res.body.should.have.property('data');
                res.body.metadata.should.have.property('success', true);
                res.body.metadata.should.have.property('error', null);
                res.body.metadata.should.have.property('statusCode', 200);
                res.body.data.should.have.property('comment');
                res.body.data.comment.should.have.property('_id', '0');
                testUtils.post(config, '/posts/'+post._id+'/comments/0/votes/down', {
                    user_id: user2Id
                })(next);
            },
            function (res, next) {
                should.exist(res);
                res.should.have.property('body');
                res.body.should.have.property('metadata');
                res.body.should.have.property('data');
                res.body.metadata.should.have.property('success', true);
                res.body.metadata.should.have.property('error', null);
                res.body.metadata.should.have.property('statusCode', 200);
                testUtils.post(config, '/posts/'+post._id+'/comments/0/votes/down', {
                    user_id: user2Id
                })(next);
            },
            function (res, next) {
                should.exist(res);
                res.should.have.property('body');
                res.body.should.have.property('metadata');
                res.body.should.have.property('data');
                res.body.metadata.should.have.property('success', false);
                res.body.metadata.should.have.property('error');
                res.body.metadata.should.have.property('statusCode', 400);
                testUtils.getPostWithErrorChecking(config, post._id)(next);
            }

        ], function (err, post) {
            should.not.exist(err);
            should.exist(post);
            post.should.have.property('comments');
            post.comments.should.be.an.Array;
            post.comments.should.have.length(1);
            post.comments[0].should.have.property('_id', '0');
            post.comments[0].should.have.property('votes');
            post.comments[0].votes.should.have.property('hotness');
            post.comments[0].votes.hotness.should.be.greaterThan(0);
            post.comments[0].votes.should.have.property('score');
            post.comments[0].votes.should.not.have.property('ups');
            post.comments[0].votes.should.not.have.property('downs');
            post.comments[0].votes.score.should.have.property('up', 1);
            post.comments[0].votes.score.should.have.property('down', 1);
            post.comments[0].votes.score.should.have.property('total', 0);
            done();
        });
    });

});
