/*global describe:false, it:false, beforeEach:false, afterEach:false*/

'use strict';


var kraken = require('kraken-js'),
    express = require('express'),
    request = require('supertest');

var db = require("../../lib/database");
var mongoose = require('mongoose');
var async = require('async');
var should = require('should');
var moment = require('moment');
var _ = require('underscore');
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

    it('In test environment, user should be able to hard set the creation date', function (done) {
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
                    author_id: userId,
                    created_at: moment(new Date(2012, 12, 23)).format(),
                    updated_at: moment(new Date(2012, 12, 23)).format()
                })(next);
            }
        ], function (err, post) {
            should.not.exist(err);
            should.exist(post);
            post.should.have.property("title", "Watch this adorable little puppy die in fire");
            post.should.have.property("content", "http://127.0.0.1:8080/fake/images/success/123456.jpg");
            post.should.have.property("content_type", "image");
            post.should.have.property("created_at");
            post.should.have.property("updated_at");
            var created_at = new Date(post.created_at);
            created_at.getTime().should.equal(new Date(2012, 12, 23).getTime());
            var updated_at = new Date(post.created_at);
            updated_at.getTime().should.equal(new Date(2012, 12, 23).getTime());
            done();
        });
    });


    //console.log('now', moment().format());
    //console.log('other', new Date(0, 0, 0, 1));
    //console.log('actual date', moment().subtract(1, 'hours'));

    var postDataSet = [
        {
            title: "1", content: "http://127.0.0.1:8080/fake/images/success/1.jpg",
            created_at: moment().subtract(1, 'hours'), updated_at: moment().subtract(1, 'hours')
        },
        {
            title: "2", content: "http://127.0.0.1:8080/fake/images/success/2.jpg",
            created_at: moment().subtract(2, 'hours'), updated_at: moment().subtract(2, 'hours')
        },
        {
            title: "3", content: "http://127.0.0.1:8080/fake/images/success/3.jpg",
            created_at: moment().subtract(3, 'hours'), updated_at: moment().subtract(3, 'hours')
        },
        {
            title: "4", content: "http://127.0.0.1:8080/fake/images/success/4.jpg",
            created_at: moment().subtract(4, 'hours'), updated_at: moment().subtract(4, 'hours')
        },
        {
            title: "5", content: "http://127.0.0.1:8080/fake/images/success/5.jpg",
            created_at: moment().subtract(5, 'hours'), updated_at: moment().subtract(5, 'hours')
        },
        {
            title: "6", content: "http://127.0.0.1:8080/fake/images/success/6.jpg",
            created_at: moment().subtract(6, 'hours'), updated_at: moment().subtract(6, 'hours')
        },
        {
            title: "7", content: "http://127.0.0.1:8080/fake/images/success/7.jpg",
            created_at: moment().subtract(7, 'hours'), updated_at: moment().subtract(7, 'hours')
        },
        {
            title: "8", content: "http://127.0.0.1:8080/fake/images/success/8.jpg",
            created_at: moment().subtract(8, 'hours'), updated_at: moment().subtract(8, 'hours')
        },
        {
            title: "9", content: "http://127.0.0.1:8080/fake/images/success/9.jpg",
            created_at: moment().subtract(9, 'hours'), updated_at: moment().subtract(9, 'hours')
        },
        {
            title: "10", content: "http://127.0.0.1:8080/fake/images/success/10.jpg",
            created_at: moment().subtract(10, 'hours'), updated_at: moment().subtract(10, 'hours')
        },
        {
            title: "11", content: "http://127.0.0.1:8080/fake/images/success/11.jpg",
            created_at: moment().subtract(1, 'days'), updated_at: moment().subtract(1, 'days')
        },
        {
            title: "12", content: "http://127.0.0.1:8080/fake/images/success/12.jpg",
            created_at: moment().subtract(2, 'days'), updated_at: moment().subtract(2, 'days')
        },
        {
            title: "13", content: "http://127.0.0.1:8080/fake/images/success/13.jpg",
            created_at: moment().subtract(3, 'days'), updated_at: moment().subtract(3, 'days')
        },
        {
            title: "14", content: "http://127.0.0.1:8080/fake/images/success/14.jpg",
            created_at: moment().subtract(4, 'days'), updated_at: moment().subtract(4, 'days')
        },
        {
            title: "15", content: "http://127.0.0.1:8080/fake/images/success/15.jpg",
            created_at: moment().subtract(5, 'days'), updated_at: moment().subtract(5, 'days')
        },
        {
            title: "16", content: "http://127.0.0.1:8080/fake/images/success/16.jpg",
            created_at: moment().subtract(6, 'days'), updated_at: moment().subtract(6, 'days')
        },
        {
            title: "17", content: "http://127.0.0.1:8080/fake/images/success/17.jpg",
            created_at: moment().subtract(10, 'days'), updated_at: moment().subtract(10, 'days')
        },
        {
            title: "18", content: "http://127.0.0.1:8080/fake/images/success/18.jpg",
            created_at: moment().subtract(15, 'days'), updated_at: moment().subtract(15, 'days')
        },
        {
            title: "19", content: "http://127.0.0.1:8080/fake/images/success/19.jpg",
            created_at: moment().subtract(20, 'days'), updated_at: moment().subtract(20, 'days')
        },
        {
            title: "20", content: "http://127.0.0.1:8080/fake/images/success/20.jpg",
            created_at: moment().subtract(22, 'days'), updated_at: moment().subtract(22, 'days')
        },
        {
            title: "21", content: "http://127.0.0.1:8080/fake/images/success/21.jpg",
            created_at: moment().subtract(24, 'days'), updated_at: moment().subtract(24, 'days')
        },
        {
            title: "22", content: "http://127.0.0.1:8080/fake/images/success/22.jpg",
            created_at: moment().subtract(25, 'days'), updated_at: moment().subtract(25, 'days')
        },
        {
            title: "23", content: "http://127.0.0.1:8080/fake/images/success/23.jpg",
            created_at: moment().subtract(26, 'days'), updated_at: moment().subtract(26, 'days')
        },
        {
            title: "24", content: "http://127.0.0.1:8080/fake/images/success/24.jpg",
            created_at: moment().subtract(27, 'days'), updated_at: moment().subtract(27, 'days')
        },
        {
            title: "25", content: "http://127.0.0.1:8080/fake/images/success/25.jpg",
            created_at: moment().subtract(28, 'days'), updated_at: moment().subtract(28, 'days')
        },
        {
            title: "26", content: "http://127.0.0.1:8080/fake/images/success/26.jpg",
            created_at: moment().subtract(50, 'days'), updated_at: moment().subtract(50, 'days')
        },
        {
            title: "27", content: "http://127.0.0.1:8080/fake/images/success/27.jpg",
            created_at: moment().subtract(100, 'days'), updated_at: moment().subtract(100, 'days')
        },
        {
            title: "28", content: "http://127.0.0.1:8080/fake/images/success/28.jpg",
            created_at: moment().subtract(150, 'days'), updated_at: moment().subtract(150, 'days')
        },
        {
            title: "29", content: "http://127.0.0.1:8080/fake/images/success/29.jpg",
            created_at: moment().subtract(200, 'days'), updated_at: moment().subtract(200, 'days')
        },
        {
            title: "30", content: "http://127.0.0.1:8080/fake/images/success/30.jpg",
            created_at: moment().subtract(300, 'days'), updated_at: moment().subtract(300, 'days')
        }
    ];


    var users = [
        {
            email: "user1@hotmail.fr",
            username: "user1",
            password: "password1"
        },
        {
            email: "user2@hotmail.fr",
            username: "user2",
            password: "password2"
        },
        {
            email: "user3@hotmail.fr",
            username: "user3",
            password: "password3"
        },
        {
            email: "user4@hotmail.fr",
            username: "user4",
            password: "password4"
        },
        {
            email: "user5@hotmail.fr",
            username: "user5",
            password: "password5"
        }
    ];

    /*
     * /posts/ -> hot
     * /posts/hot -> hot
     * /posts/new -> recent
     * /posts/best/ -> best (all time)
     * /posts/best/day -> best (day)
     * /posts/best/week -> best (week)
     * /posts/best/month -> best (month)
     * /posts/best/ever -> best (all time)
     */

    it('GET /posts/new should sort by date', function (done) {
        async.waterfall([
            testUtils.createUser(config, {
                email: "mouloud1@hotmail.fr",
                username: "kebab94",
                password: "wallah123"
            }),
            function (res, next) {
                var userId = res.body.data.user._id;
                _.each(postDataSet, function (p) {p.author_id = userId; });
                testUtils.createPosts(config, _.shuffle(postDataSet))(next);
            },
            function (postIds, next) {
                testUtils.get(config, '/posts/new')(next);
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
            //res.body.data.posts.should.have.length(20);
            res.body.data.posts.should.have.length(30);
            res.body.data.posts[0].should.have.property('title', '1');
            res.body.data.posts[1].should.have.property('title', '2');
            res.body.data.posts[2].should.have.property('title', '3');
            res.body.data.posts[3].should.have.property('title', '4');
            res.body.data.posts[4].should.have.property('title', '5');
            res.body.data.posts[5].should.have.property('title', '6');
            res.body.data.posts[6].should.have.property('title', '7');
            res.body.data.posts[7].should.have.property('title', '8');
            res.body.data.posts[8].should.have.property('title', '9');
            res.body.data.posts[9].should.have.property('title', '10');
            res.body.data.posts[10].should.have.property('title', '11');
            res.body.data.posts[11].should.have.property('title', '12');
            res.body.data.posts[12].should.have.property('title', '13');
            res.body.data.posts[13].should.have.property('title', '14');
            res.body.data.posts[14].should.have.property('title', '15');
            res.body.data.posts[15].should.have.property('title', '16');
            res.body.data.posts[16].should.have.property('title', '17');
            res.body.data.posts[17].should.have.property('title', '18');
            res.body.data.posts[18].should.have.property('title', '19');
            res.body.data.posts[19].should.have.property('title', '20');
            done();
        });
    });

    it('GET /posts/best should sort by vote number', function (done) {
        var userIds = [];
        var postIds = [];
        var posts = postDataSet;
        async.waterfall([
            testUtils.createUsers(config, users),
            function (res, next) {
                userIds = res;
                _.each(postDataSet, function (p) {p.author_id = userIds[0]; });
                testUtils.createPosts(config, posts)(next);
            },
            function (res, next) {
                var i = 0;
                _.forEach(posts, function (item) {
                    item._id = res[i];
                    //console.log(item._id, item.title, res[i]);
                    ++i;
                });
                //console.log(posts);
                testUtils.post(config, '/posts/'+posts[7]._id+'/votes/up', { user_id: userIds[1] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[7]._id+'/votes/up', { user_id: userIds[2] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[7]._id+'/votes/up', { user_id: userIds[3] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[7]._id+'/votes/up', { user_id: userIds[4] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[14]._id+'/votes/up', { user_id: userIds[1] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[14]._id+'/votes/up', { user_id: userIds[2] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[14]._id+'/votes/up', { user_id: userIds[3] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[8]._id+'/votes/up', { user_id: userIds[1] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[8]._id+'/votes/up', { user_id: userIds[2] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[9]._id+'/votes/up', { user_id: userIds[1] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[15]._id+'/votes/down', { user_id: userIds[0] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[1]._id+'/votes/down', { user_id: userIds[0] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[1]._id+'/votes/down', { user_id: userIds[1] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[20]._id+'/votes/down', { user_id: userIds[0] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[20]._id+'/votes/down', { user_id: userIds[1] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[20]._id+'/votes/down', { user_id: userIds[2] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[25]._id+'/votes/down', { user_id: userIds[0] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[25]._id+'/votes/down', { user_id: userIds[1] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[25]._id+'/votes/down', { user_id: userIds[2] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[10]._id+'/votes/down', { user_id: userIds[0] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[10]._id+'/votes/down', { user_id: userIds[1] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[10]._id+'/votes/down', { user_id: userIds[2] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[10]._id+'/votes/down', { user_id: userIds[3] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[28]._id+'/votes/down', { user_id: userIds[0] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[28]._id+'/votes/down', { user_id: userIds[1] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[28]._id+'/votes/down', { user_id: userIds[2] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[28]._id+'/votes/down', { user_id: userIds[3] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[28]._id+'/votes/down', { user_id: userIds[4] })(next);
            },
            function (_, next) {
                testUtils.get(config, '/posts/best')(next);
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
            //res.body.data.posts.should.have.length(20);
            res.body.data.posts.should.have.length(30);
            res.body.data.posts[0].should.have.property('title', '8');
            res.body.data.posts[1].should.have.property('title', '15');
            res.body.data.posts[2].should.have.property('title', '9');
            res.body.data.posts[3].should.have.property('title', '10');
            res.body.data.posts[24].should.have.property('title', '16');
            res.body.data.posts[25].should.have.property('title', '2');
            res.body.data.posts[26].should.have.property('title', '21');
            res.body.data.posts[27].should.have.property('title', '26');
            res.body.data.posts[28].should.have.property('title', '11');
            res.body.data.posts[29].should.have.property('title', '29');
            done();
        });
    });


    it('GET /posts/best/ever should sort by vote number without time limit', function (done) {
        var userIds = [];
        var postIds = [];
        var posts = postDataSet;
        async.waterfall([
            testUtils.createUsers(config, users),
            function (res, next) {
                userIds = res;
                _.each(postDataSet, function (p) {p.author_id = userIds[0]; });
                testUtils.createPosts(config, posts)(next);
            },
            function (res, next) {
                var i = 0;
                _.forEach(posts, function (item) {
                    item._id = res[i];
                    //console.log(item._id, item.title, res[i]);
                    ++i;
                });
                //console.log(posts);
                testUtils.post(config, '/posts/'+posts[7]._id+'/votes/up', { user_id: userIds[1] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[7]._id+'/votes/up', { user_id: userIds[2] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[7]._id+'/votes/up', { user_id: userIds[3] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[7]._id+'/votes/up', { user_id: userIds[4] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[14]._id+'/votes/up', { user_id: userIds[1] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[14]._id+'/votes/up', { user_id: userIds[2] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[14]._id+'/votes/up', { user_id: userIds[3] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[8]._id+'/votes/up', { user_id: userIds[1] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[8]._id+'/votes/up', { user_id: userIds[2] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[9]._id+'/votes/up', { user_id: userIds[1] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[15]._id+'/votes/down', { user_id: userIds[0] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[1]._id+'/votes/down', { user_id: userIds[0] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[1]._id+'/votes/down', { user_id: userIds[1] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[20]._id+'/votes/down', { user_id: userIds[0] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[20]._id+'/votes/down', { user_id: userIds[1] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[20]._id+'/votes/down', { user_id: userIds[2] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[25]._id+'/votes/down', { user_id: userIds[0] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[25]._id+'/votes/down', { user_id: userIds[1] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[25]._id+'/votes/down', { user_id: userIds[2] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[10]._id+'/votes/down', { user_id: userIds[0] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[10]._id+'/votes/down', { user_id: userIds[1] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[10]._id+'/votes/down', { user_id: userIds[2] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[10]._id+'/votes/down', { user_id: userIds[3] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[28]._id+'/votes/down', { user_id: userIds[0] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[28]._id+'/votes/down', { user_id: userIds[1] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[28]._id+'/votes/down', { user_id: userIds[2] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[28]._id+'/votes/down', { user_id: userIds[3] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[28]._id+'/votes/down', { user_id: userIds[4] })(next);
            },
            function (_, next) {
                testUtils.get(config, '/posts/best/ever')(next);
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
            //res.body.data.posts.should.have.length(20);
            res.body.data.posts.should.have.length(30);
            res.body.data.posts[0].should.have.property('title', '8');
            res.body.data.posts[1].should.have.property('title', '15');
            res.body.data.posts[2].should.have.property('title', '9');
            res.body.data.posts[3].should.have.property('title', '10');
            res.body.data.posts[24].should.have.property('title', '16');
            res.body.data.posts[25].should.have.property('title', '2');
            res.body.data.posts[26].should.have.property('title', '21');
            res.body.data.posts[27].should.have.property('title', '26');
            res.body.data.posts[28].should.have.property('title', '11');
            res.body.data.posts[29].should.have.property('title', '29');
            done();
        });
    });


    it('GET /posts/best/month should sort by vote number and retain only post created this month', function (done) {
        var userIds = [];
        var postIds = [];
        var posts = postDataSet;
        async.waterfall([
            testUtils.createUsers(config, users),
            function (res, next) {
                userIds = res;
                _.each(postDataSet, function (p) {p.author_id = userIds[0]; });
                testUtils.createPosts(config, posts)(next);
            },
            function (res, next) {
                var i = 0;
                _.forEach(posts, function (item) {
                    item._id = res[i];
                    ++i;
                });
                //console.log(posts);
                testUtils.post(config, '/posts/'+posts[29]._id+'/votes/up', { user_id: userIds[1] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[29]._id+'/votes/up', { user_id: userIds[2] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[29]._id+'/votes/up', { user_id: userIds[3] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[29]._id+'/votes/up', { user_id: userIds[4] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[14]._id+'/votes/up', { user_id: userIds[1] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[14]._id+'/votes/up', { user_id: userIds[2] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[14]._id+'/votes/up', { user_id: userIds[3] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[8]._id+'/votes/up', { user_id: userIds[1] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[8]._id+'/votes/up', { user_id: userIds[2] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[9]._id+'/votes/up', { user_id: userIds[1] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[15]._id+'/votes/down', { user_id: userIds[0] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[1]._id+'/votes/down', { user_id: userIds[0] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[1]._id+'/votes/down', { user_id: userIds[1] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[20]._id+'/votes/down', { user_id: userIds[0] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[20]._id+'/votes/down', { user_id: userIds[1] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[20]._id+'/votes/down', { user_id: userIds[2] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[25]._id+'/votes/down', { user_id: userIds[0] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[25]._id+'/votes/down', { user_id: userIds[1] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[25]._id+'/votes/down', { user_id: userIds[2] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[10]._id+'/votes/down', { user_id: userIds[0] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[10]._id+'/votes/down', { user_id: userIds[1] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[10]._id+'/votes/down', { user_id: userIds[2] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[10]._id+'/votes/down', { user_id: userIds[3] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[28]._id+'/votes/down', { user_id: userIds[0] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[28]._id+'/votes/down', { user_id: userIds[1] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[28]._id+'/votes/down', { user_id: userIds[2] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[28]._id+'/votes/down', { user_id: userIds[3] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[28]._id+'/votes/down', { user_id: userIds[4] })(next);
            },
            function (_, next) {
                testUtils.get(config, '/posts/best/month')(next);
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
            //15 9 10 1 3 4 5 6 7 8 12 13 14 17 18 19 20 22 23 24 25 16 2 21 11
            res.body.data.posts.should.have.length(25);
            res.body.data.posts[0].should.have.property('title', '15');
            res.body.data.posts[1].should.have.property('title', '9');
            res.body.data.posts[2].should.have.property('title', '10');
            //res.body.data.posts[25].should.have.property('title', '2');
            //res.body.data.posts[26].should.have.property('title', '21');
            //res.body.data.posts[27].should.have.property('title', '26');
            //res.body.data.posts[28].should.have.property('title', '11');
            //res.body.data.posts[29].should.have.property('title', '29');
            done();
        });
    });

    it('GET /posts/best/week should sort by vote number and retain only post created this week', function (done) {
        var userIds = [];
        var postIds = [];
        var posts = postDataSet;
        async.waterfall([
            testUtils.createUsers(config, users),
            function (res, next) {
                userIds = res;
                _.each(postDataSet, function (p) {p.author_id = userIds[0]; });
                testUtils.createPosts(config, posts)(next);
            },
            function (res, next) {
                var i = 0;
                _.forEach(posts, function (item) {
                    item._id = res[i];
                    ++i;
                });
                //console.log(posts);
                testUtils.post(config, '/posts/'+posts[29]._id+'/votes/up', { user_id: userIds[1] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[29]._id+'/votes/up', { user_id: userIds[2] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[29]._id+'/votes/up', { user_id: userIds[3] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[29]._id+'/votes/up', { user_id: userIds[4] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[17]._id+'/votes/up', { user_id: userIds[1] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[17]._id+'/votes/up', { user_id: userIds[2] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[17]._id+'/votes/up', { user_id: userIds[3] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[8]._id+'/votes/up', { user_id: userIds[1] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[8]._id+'/votes/up', { user_id: userIds[2] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[9]._id+'/votes/up', { user_id: userIds[1] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[15]._id+'/votes/down', { user_id: userIds[0] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[1]._id+'/votes/down', { user_id: userIds[0] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[1]._id+'/votes/down', { user_id: userIds[1] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[20]._id+'/votes/down', { user_id: userIds[0] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[20]._id+'/votes/down', { user_id: userIds[1] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[20]._id+'/votes/down', { user_id: userIds[2] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[25]._id+'/votes/down', { user_id: userIds[0] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[25]._id+'/votes/down', { user_id: userIds[1] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[25]._id+'/votes/down', { user_id: userIds[2] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[10]._id+'/votes/down', { user_id: userIds[0] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[10]._id+'/votes/down', { user_id: userIds[1] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[10]._id+'/votes/down', { user_id: userIds[2] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[10]._id+'/votes/down', { user_id: userIds[3] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[28]._id+'/votes/down', { user_id: userIds[0] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[28]._id+'/votes/down', { user_id: userIds[1] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[28]._id+'/votes/down', { user_id: userIds[2] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[28]._id+'/votes/down', { user_id: userIds[3] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[28]._id+'/votes/down', { user_id: userIds[4] })(next);
            },
            function (_, next) {
                testUtils.get(config, '/posts/best/week')(next);
            }
        ], function (err, res) {
            should.not.exist(err);
            should.exist(res);
            //_.each(res.body.data.posts, function (p) {
            //    console.log(p.title, p.votes.score.total, p.created_at);
            //});
            //9 10 1 3 4 5 6 7 8 12 13 14 16 2 21 11
            res.should.have.property('body');
            res.body.should.have.property('metadata');
            res.body.should.have.property('data');
            res.body.metadata.should.have.property('success', true);
            res.body.metadata.should.have.property('error', null);
            res.body.metadata.should.have.property('statusCode', 200);
            res.body.data.should.have.property('posts');
            res.body.data.posts.should.be.an.Array;
            res.body.data.posts.should.have.length(16);
            res.body.data.posts[0].should.have.property('title', '9');
            res.body.data.posts[1].should.have.property('title', '10');
            res.body.data.posts[13].should.have.property('title', '16');
            res.body.data.posts[14].should.have.property('title', '2');
            res.body.data.posts[15].should.have.property('title', '11');
            done();
        });
    });

    it('GET /posts/best/day should sort by vote number and retain only post created this day', function (done) {
        var userIds = [];
        var postIds = [];
        var posts = postDataSet;
        async.waterfall([
            testUtils.createUsers(config, users),
            function (res, next) {
                userIds = res;
                _.each(postDataSet, function (p) {p.author_id = userIds[0]; });
                testUtils.createPosts(config, posts)(next);
            },
            function (res, next) {
                var i = 0;
                _.forEach(posts, function (item) {
                    item._id = res[i];
                    ++i;
                });
                //console.log(posts);
                testUtils.post(config, '/posts/'+posts[11]._id+'/votes/up', { user_id: userIds[1] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[11]._id+'/votes/up', { user_id: userIds[2] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[11]._id+'/votes/up', { user_id: userIds[3] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[11]._id+'/votes/up', { user_id: userIds[4] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[14]._id+'/votes/up', { user_id: userIds[1] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[14]._id+'/votes/up', { user_id: userIds[2] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[14]._id+'/votes/up', { user_id: userIds[3] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[8]._id+'/votes/up', { user_id: userIds[1] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[8]._id+'/votes/up', { user_id: userIds[2] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[9]._id+'/votes/up', { user_id: userIds[1] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[15]._id+'/votes/down', { user_id: userIds[0] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[1]._id+'/votes/down', { user_id: userIds[0] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[1]._id+'/votes/down', { user_id: userIds[1] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[20]._id+'/votes/down', { user_id: userIds[0] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[20]._id+'/votes/down', { user_id: userIds[1] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[20]._id+'/votes/down', { user_id: userIds[2] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[25]._id+'/votes/down', { user_id: userIds[0] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[25]._id+'/votes/down', { user_id: userIds[1] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[25]._id+'/votes/down', { user_id: userIds[2] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[10]._id+'/votes/down', { user_id: userIds[0] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[10]._id+'/votes/down', { user_id: userIds[1] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[10]._id+'/votes/down', { user_id: userIds[2] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[10]._id+'/votes/down', { user_id: userIds[3] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[28]._id+'/votes/down', { user_id: userIds[0] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[28]._id+'/votes/down', { user_id: userIds[1] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[28]._id+'/votes/down', { user_id: userIds[2] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[28]._id+'/votes/down', { user_id: userIds[3] })(next);
            },
            function (res, next) {
                testUtils.post(config, '/posts/'+posts[28]._id+'/votes/down', { user_id: userIds[4] })(next);
            },
            function (_, next) {
                testUtils.get(config, '/posts/best/day')(next);
            }
        ], function (err, res) {
            should.not.exist(err);
            should.exist(res);
            //_.each(res.body.data.posts, function (p) {
            //    console.log(p.title, p.votes.score.total, p.created_at);
            //});
            //9 10 1 3 4 5 6 7 8 16 2
            res.should.have.property('body');
            res.body.should.have.property('metadata');
            res.body.should.have.property('data');
            res.body.metadata.should.have.property('success', true);
            res.body.metadata.should.have.property('error', null);
            res.body.metadata.should.have.property('statusCode', 200);
            res.body.data.should.have.property('posts');
            res.body.data.posts.should.be.an.Array;
            res.body.data.posts.should.have.length(10);
            res.body.data.posts[0].should.have.property('title', '9');
            res.body.data.posts[1].should.have.property('title', '10');
            res.body.data.posts[9].should.have.property('title', '2');
            done();
        });
    });


});
