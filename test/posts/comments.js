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

    it('User should be able to comment on a post', function (done) {
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
                testUtils.post(config, '/posts/'+post._id+'/comments', {
                    user_id: userId,
                    message: 'my first comment'
                })(next);
            },
            function (_, next) {
                testUtils.getPostWithErrorChecking(config, post._id)(next);
            }
        ], function (err, post) {
            should.not.exist(err);
            should.exist(post);
            post.should.have.property('comments');
            post.comments.should.be.an.Array;
            post.comments.should.have.length(1);
            post.comments[0].should.have.property('message', 'my first comment');
            post.comments[0].should.have.property('user_id', userId);
            post.comments[0].should.have.property('votes');
            post.comments[0].votes.should.have.property('hotness');
            post.comments[0].votes.hotness.should.be.greaterThan(0);
            post.comments[0].votes.should.have.property('score');
            post.comments[0].votes.score.should.have.property('up', 1);
            post.comments[0].votes.score.should.have.property('down', 0);
            post.comments[0].votes.score.should.have.property('up', 1);
            post.comments[0].votes.score.should.have.property('total', 1);
            post.comments[0].should.have.property('replies');
            post.comments[0].replies.should.have.be.an.Array;
            post.comments[0].should.have.property('created_at');
            post.comments[0].should.have.property('updated_at');
            done();
        });
    });

    it('An user should be able to comment twice on a post', function (done) {
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
                testUtils.post(config, '/posts/'+post._id+'/comments', {
                    user_id: userId,
                    message: 'my first comment'
                })(next);
            },
            function (_, next) {
                testUtils.post(config, '/posts/'+post._id+'/comments', {
                    user_id: userId,
                    message: 'my second comment'
                })(next);
            },
            function (_, next) {
                testUtils.getPostWithErrorChecking(config, post._id)(next);
            }
        ], function (err, post) {
            should.not.exist(err);
            should.exist(post);
            post.should.have.property('comments');
            post.comments.should.be.an.Array;
            post.comments.should.have.length(2);
            post.comments[0].should.have.property('message', 'my first comment');
            post.comments[0].should.have.property('user_id', userId);
            post.comments[1].should.have.property('message', 'my second comment');
            post.comments[1].should.have.property('user_id', userId);
            done();
        });
    });


    it('Two users should be able to comment on the same post', function (done) {
        var post = null;
        var mouloudId = null;
        var jeanKevinId = null;
        async.waterfall([
            testUtils.createUsers(config, [{
                email: "mouloud1@hotmail.fr",
                username: "kebab94",
                password: "wallah123"
            }, {
                email: "jean-kevindelabatte@hotmail.fr",
                username: "jkdlb1999",
                password: "jeankevin"
            }]),
            function (userIds, next) {
                mouloudId = userIds[0];
                jeanKevinId = userIds[1];
                console.log(userIds);
                testUtils.createPostWithErrorChecking(config, {
                    title: "Watch this adorable little puppy die in fire",
                    content: "http://127.0.0.1:8080/fake/images/success/123456.jpg",
                    author_id: mouloudId
                })(next);
            },
            function (_post, next) {
                post = _post;
                testUtils.post(config, '/posts/'+post._id+'/comments', {
                    user_id: mouloudId,
                    message: 'my first comment'
                })(next);
            },
            function (_, next) {
                testUtils.post(config, '/posts/'+post._id+'/comments', {
                    user_id: jeanKevinId,
                    message: 'my first comment too'
                })(next);
            },
            function (_, next) {
                testUtils.getPostWithErrorChecking(config, post._id)(next);
            }
        ], function (err, post) {
            should.not.exist(err);
            should.exist(post);
            post.should.have.property('comments');
            post.comments.should.be.an.Array;
            post.comments.should.have.length(2);
            post.comments[0].should.have.property('message', 'my first comment');
            post.comments[0].should.have.property('user_id', mouloudId);
            post.comments[1].should.have.property('message', 'my first comment too');
            post.comments[1].should.have.property('user_id', jeanKevinId);
            done();
        });
    });


    it('An user should be able to comment on his comment (test until depth 4)', function (done) {
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
                testUtils.post(config, '/posts/'+post._id+'/comments', {
                    user_id: userId,
                    message: 'depth 0'
                })(next);
            },
            function (_, next) {
                testUtils.post(config, '/posts/'+post._id+'/comments/'+'0', {
                    user_id: userId,
                    message: 'depth 1'
                })(next);
            },
            function (_, next) {
                testUtils.post(config, '/posts/'+post._id+'/comments/'+'0.0', {
                    user_id: userId,
                    message: 'depth 2'
                })(next);
            },
            function (_, next) {
                testUtils.post(config, '/posts/'+post._id+'/comments/'+'0.0.0', {
                    user_id: userId,
                    message: 'depth 3'
                })(next);
            },
            function (_, next) {
                testUtils.post(config, '/posts/'+post._id+'/comments/'+'0.0.0.0', {
                    user_id: userId,
                    message: 'depth 4'
                })(next);
            },
            function (_, next) {
                testUtils.getPostWithErrorChecking(config, post._id)(next);
            }
        ], function (err, post) {
            should.not.exist(err);
            should.exist(post);
            post.should.have.property('comments');
            post.comments.should.be.an.Array;
            post.comments.should.have.length(2);
            post.comments[0].should.have.property('message', 'depth 0');
            post.comments[0].should.have.property('user_id', userId);

            post.comments[0].replies.should.be.an.Array;
            post.comments[0].replies.should.have.length(1);
            post.comments[0].replies[0].should.have.property('message', 'depth 1');
            post.comments[0].replies[0].should.have.property('user_id', userId);

            post.comments[0].replies[0].replies.should.be.an.Array;
            post.comments[0].replies[0].replies.should.have.length(1);
            post.comments[0].replies[0].replies[0].should.have.property('message', 'depth 2');
            post.comments[0].replies[0].replies[0].should.have.property('user_id', userId);

            post.comments[0].replies[0].replies[0].replies.should.be.an.Array;
            post.comments[0].replies[0].replies[0].replies.should.have.length(1);
            post.comments[0].replies[0].replies[0].replies[0].should.have.property('message', 'depth 3');
            post.comments[0].replies[0].replies[0].replies[0].should.have.property('user_id', userId);

            post.comments[0].replies[0].replies[0].replies[0].replies.should.be.an.Array;
            post.comments[0].replies[0].replies[0].replies[0].replies.should.have.length(1);
            post.comments[0].replies[0].replies[0].replies[0].replies[0].should.have.property('message', 'depth 4');
            post.comments[0].replies[0].replies[0].replies[0].replies[0].should.have.property('user_id', userId);
            done();
        });
    });


    it('Two users should be able to comment on each other comment (test until depth 4)', function (done) {
        var post = null;
        var mouloudId = null;
        var jeanKevinId = null;
        async.waterfall([
            testUtils.createUsers(config, [{
                email: "mouloud1@hotmail.fr",
                username: "kebab94",
                password: "wallah123"
            }, {
                email: "jean-kevindelabatte@hotmail.fr",
                username: "jkdlb1999",
                password: "jeankevin"
            }]),
            function (userIds, next) {
                mouloudId = userIds[0];
                jeanKevinId = userIds[1];
                testUtils.createPostWithErrorChecking(config, {
                    title: "Watch this adorable little puppy die in fire",
                    content: "http://127.0.0.1:8080/fake/images/success/123456.jpg",
                    author_id: mouloudId
                })(next);
            },
            function (_post, next) {
                post = _post;
                testUtils.post(config, '/posts/'+post._id+'/comments', {
                    user_id: mouloudId,
                    message: 'depth 0'
                })(next);
            },
            function (_, next) {
                testUtils.post(config, '/posts/'+post._id+'/comments/'+'0', {
                    user_id: jeanKevinId,
                    message: 'depth 1'
                })(next);
            },
            function (_, next) {
                testUtils.post(config, '/posts/'+post._id+'/comments/'+'0.0', {
                    user_id: mouloudId,
                    message: 'depth 2'
                })(next);
            },
            function (_, next) {
                testUtils.post(config, '/posts/'+post._id+'/comments/'+'0.0.0', {
                    user_id: jeanKevinId,
                    message: 'depth 3'
                })(next);
            },
            function (_, next) {
                testUtils.post(config, '/posts/'+post._id+'/comments/'+'0.0.0.0', {
                    user_id: mouloudId,
                    message: 'depth 4'
                })(next);
            },
            function (_, next) {
                testUtils.getPostWithErrorChecking(config, post._id)(next);
            }
        ], function (err, post) {
            should.not.exist(err);
            should.exist(post);
            post.should.have.property('comments');
            post.comments.should.be.an.Array;
            post.comments.should.have.length(2);
            post.comments[0].should.have.property('message', 'depth 0');
            post.comments[0].should.have.property('user_id', mouloudId);

            post.comments[0].replies.should.be.an.Array;
            post.comments[0].replies.should.have.length(1);
            post.comments[0].replies[0].should.have.property('message', 'depth 1');
            post.comments[0].replies[0].should.have.property('user_id', jeanKevinId);

            post.comments[0].replies[0].replies.should.be.an.Array;
            post.comments[0].replies[0].replies.should.have.length(1);
            post.comments[0].replies[0].replies[0].should.have.property('message', 'depth 2');
            post.comments[0].replies[0].replies[0].should.have.property('user_id', mouloudId);

            post.comments[0].replies[0].replies[0].replies.should.be.an.Array;
            post.comments[0].replies[0].replies[0].replies.should.have.length(1);
            post.comments[0].replies[0].replies[0].replies[0].should.have.property('message', 'depth 3');
            post.comments[0].replies[0].replies[0].replies[0].should.have.property('user_id', jeanKevinId);

            post.comments[0].replies[0].replies[0].replies[0].replies.should.be.an.Array;
            post.comments[0].replies[0].replies[0].replies[0].replies.should.have.length(1);
            post.comments[0].replies[0].replies[0].replies[0].replies[0].should.have.property('message', 'depth 4');
            post.comments[0].replies[0].replies[0].replies[0].replies[0].should.have.property('user_id', mouloudId);
            done();
        });
    });

});
