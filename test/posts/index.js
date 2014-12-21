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

    var __res = null;

    beforeEach(function (done) {

        async.waterfall([
            function (next) {
                //create a express mock
                app = express();
                app.on('start', next);
                app.use(kraken({
                    basedir: process.cwd(),
                    onconfig: function (config, next) {
                        db.config(config.get('database')["test"]);
                        next(null, config);
                    }
                }));

                mock = app.listen(1337);
            },
            function (next) {
                //use hard coded route to get a csrf token
                request(mock)
                    .get('/csrf')
                    .end(function (err, res) {
                        next(null, res);
                    });
            },
            function (res, next) {
                __res = res;
                //drop database
                mongoose.connection.db.dropDatabase(next);
            }
        ], function (err, res) {
            done();
        });


    });


    afterEach(function (done) {
        async.waterfall([
            function (next) {
                mock.close(next);
            },
            function (next) {
                //drop database
                mongoose.connection.db.dropDatabase(next);
            },
            function (_, next) {
                //properly close mongo connection to that it can be reused for another unit test
                mongoose.disconnect();
                next();
            }
        ], function (err,res) {
            done();
        });

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
        async.waterfall([
            function (next) {
                request(mock)
                    .post('/users')
                    .set('Cookie', mapCookies(__res.headers['set-cookie']))
                    .send({
                        _csrf: __res.body._csrf,
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
                var userId = res.body.data.user._id;
               // console.log(res.headers);
                request(mock)
                    .post('/posts')
                    .set('Cookie', mapCookies(__res.headers['set-cookie']))
                    .send({
                        _csrf: __res.body._csrf,
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
            function (next) {
                request(mock)
                    .post('/users')
                    .set('Cookie', mapCookies(__res.headers['set-cookie']))
                    .send({
                        _csrf: __res.body._csrf,
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
                var userId = res.body.data.user._id;
                // console.log(res.headers);
                request(mock)
                    .post('/posts')
                    .set('Cookie', mapCookies(__res.headers['set-cookie']))
                    .send({
                        _csrf: __res.body._csrf,
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
            function (next) {
                request(mock)
                    .post('/users')
                    .set('Cookie', mapCookies(__res.headers['set-cookie']))
                    .send({
                        _csrf: __res.body._csrf,
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
                var userId = res.body.data.user._id;
                // console.log(res.headers);
                request(mock)
                    .post('/posts')
                    .set('Cookie', mapCookies(__res.headers['set-cookie']))
                    .send({
                        _csrf: __res.body._csrf,
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
            function (next) {
                request(mock)
                    .post('/users')
                    .set('Cookie', mapCookies(__res.headers['set-cookie']))
                    .send({
                        _csrf: __res.body._csrf,
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
                var userId = res.body.data.user._id;
                // console.log(res.headers);
                request(mock)
                    .post('/posts')
                    .set('Cookie', mapCookies(__res.headers['set-cookie']))
                    .send({
                        _csrf: __res.body._csrf,
                        metadata: {},
                        data: {
                            post: {
                                title: "Game of Thrones Saison 5 Episode 1",
                                content: "https://www.youtube.com/watch?v=dQw4w945sd4f8sdf4WgXcQ",
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

});
