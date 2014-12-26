'use strict';

var kraken = require('kraken-js'),
    express = require('express'),
    request = require('supertest');

var db = require('./database');
var mongoose = require('mongoose');
var async = require('async');
var _ = require('underscore');
var should = require('should');

var mapCookies = function (cookies) {
    return cookies.map(function (r) {
        return r.replace('; path=/; httponly', '');
    }).join('; ');
};

module.exports = {

    mapCookies: mapCookies,

    beforeEach: function (config) {

        return function (done) {

            async.waterfall([
                function (next) {
                    //create a express mock
                    process.env.NODE_ENV = 'test';
                    config.app = express();
                    config.app.on('start', next);
                    config.app.use(kraken({
                        basedir: process.cwd(),
                        onconfig: function (config, next) {
                            db.config(config.get('database'));
                            next(null, config);
                        }
                    }));
                    config.mock = config.app.listen(1337);
                },
                function (next) {
                    //use hard coded route to get a csrf token
                    request(config.mock)
                        .get('/csrf')
                        .end(function (err, res) {
                            next(null, res);
                        });
                },
                function (res, next) {
                    config.res = res;
                    //drop database
                    mongoose.connection.db.dropDatabase(next);
                }
            ], function (err, res) {
                done();
            });


        };
    },

    afterEach: function (config) {
        return function (done) {
            async.waterfall([
                function (next) {
                    config.mock.close(next);
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
            ], function (err, res) {
                done();
            });

        };
    },

    createUser: function (config, user) {

        return function (next) {
            request(config.mock)
                .post('/users')
                .set('Cookie', mapCookies(config.res.headers['set-cookie']))
                .send({
                    _csrf: config.res.body._csrf,
                    metadata: {},
                    data: {
                        user: user
                    }
                })
                .expect(200, function (err, res) {
                    next(null, res);
                });
        };
    },

    createUsers: function (config, users) {
        return function (next) {
            async.mapSeries(users,
                function (item, next) {
                    request(config.mock)
                        .post('/users')
                        .set('Cookie', mapCookies(config.res.headers['set-cookie']))
                        .send({
                            _csrf: config.res.body._csrf,
                            metadata: {},
                            data: {
                                user: item
                            }
                        })
                        .expect(200, function (err, res) {
                            next(null, res);
                        });
                },
                function (err, res) {
                    res = _.map(res, function (p) {return p.body.data.user._id;});
                    console.log('after createUsers',res);
                    next(null, res);
                }
            );
        };
    },

    createPosts: function (config, posts) {
        return function (next) {
            async.mapSeries(posts,
                function (item, next) {
                    request(config.mock)
                        .post('/posts')
                        .set('Cookie', mapCookies(config.res.headers['set-cookie']))
                        .send({
                            _csrf: config.res.body._csrf,
                            metadata: {},
                            data: {
                                post: item
                            }
                        })
                        .expect(200, function (err, res) {
                            next(null, res);
                        });
                },
                function (err, res) {
                    res = _.map(res, function (p) {return p.body.data.post._id;});
                    next(null, res);
                }
            );
        };
    },

    createPostWithErrorChecking: function (config, postData) {

        return function (next) {
            request(config.mock)
                .post('/posts')
                .set('Cookie', mapCookies(config.res.headers['set-cookie']))
                .send({
                    _csrf: config.res.body._csrf,
                    metadata: {},
                    data: {
                        post: postData
                    }
                })
                .expect(200, function (err, res) {
                    //console.log("wat", res.body, res.text);
                    should.exist(res);
                    res.should.have.property('body');
                    res.body.should.have.property('metadata');
                    res.body.should.have.property('data');
                    res.body.metadata.should.have.property('success', true);
                    res.body.metadata.should.have.property('error', null);
                    res.body.metadata.should.have.property('statusCode', 200);
                    res.body.data.should.have.property('post');
                    res.body.data.post.should.have.property('_id');
                    res.body.data.post.should.have.property('title');
                    res.body.data.post.should.have.property('content');
                    res.body.data.post.should.have.property('content_type');
                    res.body.data.post.should.have.property('created_at');
                    res.body.data.post.should.have.property('updated_at');
                    next(null, res.body.data.post);
                });
        };

    },

    post: function (config, route, data) {
        return function (next) {
            request(config.mock)
                .post(route)
                .set('Cookie', mapCookies(config.res.headers['set-cookie']))
                .send({
                    _csrf: config.res.body._csrf,
                    metadata: {},
                    data: data
                })
                .expect(200, function (err, res) {
                    next(null, res);
                });
        };
    },

    createPost: function (config, postData) {

        return function (next) {
            request(config.mock)
                .post('/posts')
                .set('Cookie', mapCookies(config.res.headers['set-cookie']))
                .send({
                    _csrf: config.res.body._csrf,
                    metadata: {},
                    data: {
                        post: postData
                    }
                })
                .expect(200, function (err, res) {
                    next(null, res);
                });
        };

    },

    getPostWithErrorChecking: function (config, postId, user_id) {
        var urlParams = '';
        if (user_id) {
            urlParams = '?user_id='+user_id;
        }
        return function (next) {
            request(config.mock)
                .get('/posts/'+postId+urlParams)
                .set('Cookie', mapCookies(config.res.headers['set-cookie']))
                .expect(200, function (err, res) {
                    should.exist(res);
                    should.not.exist(err);
                    res.should.have.property('body');
                    res.body.should.have.property('metadata');
                    res.body.should.have.property('data');
                    res.body.metadata.should.have.property('success', true);
                    res.body.metadata.should.have.property('error', null);
                    res.body.metadata.should.have.property('statusCode', 200);
                    res.body.data.should.have.property('post');
                    res.body.data.post.should.have.property('_id');
                    res.body.data.post.should.have.property('title');
                    res.body.data.post.should.have.property('content');
                    res.body.data.post.should.have.property('content_type');
                    res.body.data.post.should.have.property('created_at');
                    res.body.data.post.should.have.property('updated_at');
                    next(null, res.body.data.post);
                });
        };
    },
    getPost: function (config, postId, user_id) {
        var urlParams = '';
        if (user_id) {
            urlParams = '?user_id='+user_id;
        }
        return function (next) {
            request(config.mock)
                .get('/posts/'+postId+urlParams)
                .set('Cookie', mapCookies(config.res.headers['set-cookie']))
                .expect(200, function (err, res) {
                    next(null, res);
                });
        };
    },

    get: function (config, route, user_id) {
        var urlParams = '';
        if (user_id) {
            urlParams = '?user_id='+user_id;
        }
        return function (next) {
            request(config.mock)
                .get(route+urlParams)
                .set('Cookie', mapCookies(config.res.headers['set-cookie']))
                .expect(200, function (err, res) {
                    next(null, res);
                });
        };
    }
};
