'use strict';

var moment = require('moment');
var async = require('async');
var _ = require('underscore');
var utils = require('../../lib/utils');
var urlCheck = require('../../lib/urlCheck');
var ranking = require('../../lib/ranking');

var PostsModel = require('../../models/posts');
var UsersModel = require('../../models/users');

var votesRouter = require('./votes');
var commentsRouter = require('./comments');
var votesCommentsRouter = require('./votes_comments');


module.exports = function (router) {



    var _generateQueryObjectFromOptions = function (query, options) {
        if (options.type === 'new') {
            query.sort({ created_at: 'desc'});
        } else if (options.type === 'best') {
            query.sort({ 'votes.score.total': 'desc'});
        } else if (options.type === 'hot') {
            query.sort({ 'votes.hotness': 'desc'});
        }

        if (options.args === 'day') {
            query.where('created_at').gte(moment().subtract(1, 'days'));
        } else if (options.args === 'week') {
            query.where('created_at').gte(moment().subtract(7, 'days'));
        } else if (options.args === 'month') {
            query.where('created_at').gte(moment().subtract(1, 'months'));
        }

        if (options.page <= 0) {
            options.page = 1;
        }
        query.skip((options.page - 1) * 20);
        query.limit(20);
    };

    var index = function (req, res, options) {

        var query = null;
        query = PostsModel.find();

        _generateQueryObjectFromOptions(query, options);

        var user_id = req.query.user_id || null;


        var fields = [
            '_id', 'title', 'content', 'content_type', 'author', 'status',
            'votes.hotness', 'votes.score.down', 'votes.score.up', 'votes.score.total',
            'created_at', 'updated_at'
        ];
        query.select(fields.join(' '));
        async.waterfall([
            function (next) {
                query.exec(function (err, posts) {
                    if (err) {
                        next(utils.json.ServerError('err occurred in mongodb: '+err));
                    } else {
                        var objs = _.map(posts, function (p) { return p.toObject(); });
                        next(null, objs);
                        //utils.respondJSON(res, utils.json.Ok({ posts: posts }));
                    }
                });
            },
            function (posts, next) {
                async.eachSeries(posts,
                    function (item, next) {
                        var _global = {
                            votedUp: false,
                            votedDown: false,
                            post: item
                        };
                        var post_id = item._id;
                        async.waterfall([

                            function (next) {
                                if (!user_id) {
                                    return next(null, null);
                                }
                                //check if the user as upvoted this post
                                var query = PostsModel.findOne({_id: post_id, 'votes.ups': user_id});
                                query.select('_id');
                                query.exec(next);
                            },
                            function (up_post, next) {
                                if (up_post) {
                                    _global.votedUp = true;
                                    next(null, null);
                                } else {
                                    if (!user_id) {
                                        return next(null, null);
                                    }
                                    //check if the user has downvoted this post
                                    var query = PostsModel.findOne({_id: post_id, 'votes.downs': user_id});
                                    query.select('_id');
                                    query.exec(next);
                                }
                            },
                            function (down_vote, next) {
                                if (down_vote) {
                                    _global.votedDown = true;
                                }
                                // TODO Those variables are undefined
//                                _global.post.votes.user_voted_up = _global.votedUp;
//                                _global.post.votes.user_voted_down = _global.votedDown;
                                next(null);
                            }
                        ], next);
                    },
                    function (err) {
                        next(err, posts);
                    }
                );
            }
        ], function (err, posts) {
            if (err) {
                utils.respondJSON(res, err);
            } else {
                utils.respondJSON(res, utils.json.Ok({ posts: posts}));
            }
        });


    };

    router.get('/', function (req, res) {
        return index(req, res, {
            type: 'hot',
            args: '',
            page: req.query.page || 1
        });
    });

    router.get('/hot', function (req, res) {
        return index(req, res, {
            type: 'hot',
            args: '',
            page: req.query.page || 1
        });
    });

    router.get('/new', function (req, res) {
        return index(req, res, {
            type: 'new',
            args: '',
            page: req.query.page || 1
        });
    });

    router.get('/best', function (req, res) {
        return index(req, res, {
            type: 'best',
            args: 'ever',
            page: req.query.page || 1
        });
    });

    router.get('/best/day', function (req, res) {
        return index(req, res, {
            type: 'best',
            args: 'day',
            page: req.query.page || 1
        });
    });

    router.get('/best/week', function (req, res) {
        return index(req, res, {
            type: 'best',
            args: 'week',
            page: req.query.page || 1
        });
    });

    router.get('/best/month', function (req, res) {
        return index(req, res, {
            type: 'best',
            args: 'month',
            page: req.query.page || 1
        });
    });

    router.get('/best/ever', function (req, res) {
        return index(req, res, {
            type: 'best',
            args: 'ever',
            page: req.query.page || 1
        });
    });


    router.get('/:post_id', function (req, res) {

        var post_id = req.params.post_id;
        var user_id = req.query.user_id || null;

        if (!post_id) {
            return utils.respondJSON(res, utils.json.BadRequest('url param post_id is required'));
        }

        //var fields = [
        //    '_id', 'title', 'content', 'content_type', 'author_id', 'status',
        //    'votes.hotness', 'votes.score.down', 'votes.score.up', 'votes.score.total',
        //    'comments', 'created_at', 'updated_at', '-comments.votes.ups', '-comments.votes.downs'
        //];
        var fields = [
            '-votes.ups', '-votes.downs', '-comments.votes.ups', '-comments.votes.downs'
        ];
        var _global = {
            votedUp: false,
            votedDown: false,
            post: {}
        };
        async.waterfall([
           function (next) {
               //GET the actual post
               PostsModel.findById(post_id, fields.join(' '),
                   function (err, post) {
                       if (err) {
                           next(utils.json.ServerError('err occurred in mongodb: '+err));
                       } else if (!post) {
                           next(utils.json.NotFound(post_id, 'Post'));
                       } else {
                           next(null, post);
                       }
                   });
           },
            function (post, next) {
                _global.post = post.toObject();
                if (!user_id) {
                    return next(null, null);
                }
                //check if the user as upvoted this post
                var query = PostsModel.findOne({_id: post_id, 'votes.ups': user_id});
                query.select('_id');
                query.exec(next);
            },
            function (up_post, next) {
                if (up_post) {
                    _global.votedUp = true;
                    next(null, null);
                } else {
                    if (!user_id) {
                        return next(null, null);
                    }
                    //check if the user has downvoted this post1
                    var query = PostsModel.findOne({_id: post_id, 'votes.downs': user_id});
                    query.select('_id');
                    query.exec(next);
                }
            },
            function (down_vote, next) {
                if (down_vote) {
                    _global.votedDown = true;
                }
                _global.post.votes.user_voted_up = _global.votedUp;
                _global.post.votes.user_voted_down = _global.votedDown;
                next(null);
            }
        ], function (err) {
            if (err) {
                utils.respondJSON(res, err);
            } else {
                utils.respondJSON(res, utils.json.Ok({ post: _global.post }));
            }
        });

    });

    router.post('/', function (req, res) {
        var post_datas = null;
        if (req.body.data && req.body.data.post) {
            post_datas = req.body.data.post;
        } else {
            return utils.respondJSON(res,  utils.json.BadRequest('field post is required'));
        }

        if (!post_datas.title) {
            return utils.respondJSON(res,  utils.json.BadRequest('field post.title is required'));
        }

        if (!post_datas.content) {
            return utils.respondJSON(res,  utils.json.BadRequest('field post.content is required'));
        }


        var post = new PostsModel();
        var user = null;

        async.waterfall([
            function (next) {
                //check if author_id exists
                //TODO optimize this query and only select _id and username
                UsersModel.findById(post_datas.author_id, function (err, doc) {
                    //console.log('after UsersModel.findById', arguments);
                    if (err) {
                        next(utils.json.ServerError('error occured in mongodb : '+err));
                    } else if (!doc) {
                        next(utils.json.NotFound(post_datas.author_id, 'User'));
                    } else {
                        next(null, doc);
                    }
                });
            },
            function (_user, next) {
                user = _user;
                //check if the url is valid and recognized
                if (!urlCheck.isUrl(post_datas.content)) {
                    return next(utils.json.BadRequest('content is not a valid url'));
                }
                var content_type = urlCheck.fileType(post_datas.content);
                //console.log('POST /posts content_type=', content_type);
                if (content_type  === null) {
                    return next(utils.json.BadRequest('content type is currently not supported'));
                }
                urlCheck.canBeReach(post_datas.content, function (err) {
                    if (err) {
                        next(utils.json.BadRequest('content url could not be reached'));
                    } else {
                        next(null, content_type);
                    }
                });
            },
            function (content_type, next) {
                //create the document in the database
                post.title = post_datas.title;
                post.content = post_datas.content;
                post.author = {
                    _id: user._id,
                    username: user.username
                };
                post.content_type = content_type;
                //allow user to set a fake creation time when unit testing
                if (process.env.NODE_ENV === 'test') {
                    post.created_at = post_datas.created_at;
                    post.updated_at = post_datas.updated_at;
                }

                post.customCreate(next);
            }
        ], function (err) {
            if (err) {
                utils.respondJSON(res, err);
            } else {
                utils.respondJSON(res, utils.json.Ok({post: post}));
            }
        });
    });


    votesRouter(router);
    commentsRouter(router);
    votesCommentsRouter(router);


};
