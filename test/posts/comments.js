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

    it('comment test route 1', function (done) {
        var post = null;
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
            },
            function (_post, next) {
                post = _post;
                testUtils.post(config, '/posts/'+post._id+'/comments/test1')(next);
            },
            function (_, next) {
                testUtils.get(config, '/posts/'+post._id+'/comments/test_depth_0')(next);
            }
        ], function (err, res) {
            console.log(res.body);
            console.log(res.body.comments);
            console.log(res.body.comments[0].replies);
            console.log(res.body.comments[0].replies[0].replies);
            done();
        });
    });


});
