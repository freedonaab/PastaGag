'use strict';

var moment = require('moment');
var async = require('async');
var _ = require('underscore');
var utils = require('../../lib/utils');
var urlCheck = require('../../lib/urlCheck');
var ranking = require('../../lib/ranking');
var auth = require('../../lib/auth');

var PostsModel = require('../../models/posts');
var UsersModel = require('../../models/users');

module.exports = function (router) {


    //router.post('/:post_id/comments/'); //-> reply to post :post_id
    //router.post('/:post_id/comments/:comment_id'); //-> reply to comment :comment_id on post :post_id
    //router.del('/:post_id/comments/:comment_id'); //-> delete comment :comment_id on post :post_id

    router.post('/:post_id/comments', auth.isAuthenticated(null, false), function (req, res) {

        var post_id = req.params.post_id;

        var author_id =  res.locals.user ? res.locals.user._id : req.body.data.author_id;
        var message = req.body.data.message;
        if (!message) {
            return utils.respondJSON(res, utils.json.badRequest('field mesage is required'));
        }

        var fields = ['_id', 'comments'];
        var user = null;

        async.waterfall([
            function (next) {
                //TODO optimize this query and only select _id and username
                UsersModel.findById(author_id, function (err, doc) {
                    //console.log('after UsersModel.findById', arguments);
                    if (err) {
                        next(utils.json.ServerError('error occured in mongodb : '+err));
                    } else if (!doc) {
                        next(utils.json.NotFound(author_id, 'User'));
                    } else {
                        next(null, doc);
                    }
                });
            },
            function (_user, next) {
                user = _user;
                //first get the post we want to comment
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
                var new_comment = {
                    _id: post.comments.length,
                    author: {
                        _id: user._id,
                        username: user.username
                    },
                    status: 'ok',
                    message: message,
                    votes: {
                        hotness: 0,
                        score: {
                            up: 1,
                            down: 0,
                            total: 1
                        },
                        ups: [user._id],
                        downs: []
                    },
                    replies: [],
                    created_at: new Date(),
                    updated_at: new Date()
                };
                new_comment.votes.hotness = ranking.hotness(new_comment);
                post.comments.push(new_comment);
                post.save(function(err) {
                    if (err) {
                        next(utils.json.ServerError('error in mongodb:'+err));
                    } else {
                        var comment = post.comments[post.comments.length - 1];
                        comment = comment.toObject();
                        delete comment.votes.ups;
                        delete comment.votes.downs;
                        next(null, comment);
                    }
                });
            }

        ], function (err, comment) {
            if (err) {
                utils.respondJSON(res, err);
            } else {
                utils.respondJSON(res, utils.json.Ok({
                    comment: comment
                }));
            }
        });

    });


    //commentIdToDepthString('1') => comments.1
    //commentIdToDepthString('1.2') => comments.1.replies.2
    //commentIdToDepthString('1.2.3') => comments.1.replies.2.replies.3
    var commentIdToDepthString = function (commentId) {
        var depthString = 'comments.';
        var indexes = commentId.split('.');

        depthString += indexes[0];
        for (var i = 1; i < indexes.length; ++i) {
            depthString += '.replies.';
            depthString += indexes[i];
        }
        return depthString;
    };

    var commentIdToObject = function (post, commentId) {
        var indexes = commentId.split('.');
        var obj = post.comments[indexes[0]];
        for (var i = 1; i < indexes.length; ++i) {
            var index = +indexes[i];
            obj = obj.replies[index];
        }
        return obj;
    };

    var debugComment = function (post) {
        var _recurs = function (comment, tab) {
            var tabStr = '';
            for (var i = 0; i < tab; ++i) {
                tabStr += '_____';
            }
            tabStr+= ' ';
            if (comment.replies.length) {
                _recurs(comment.replies[0], tab + 1);
            }
        };
        _recurs(post.comments[0], 0);
    };

    router.post('/:post_id/comments/:comment_id/reply',  auth.isAuthenticated(null, false), function (req, res) {

        var post_id = req.params.post_id;

        //TODO: get author_id from session instead of user datas
        var author_id =  res.locals.user ? res.locals.user._id : req.body.data.author_id;
        var message = req.body.data.message;
        if (!message) {
            return utils.respondJSON(res, utils.json.badRequest('field mesage is required'));
        }

        var comment_id = req.params.comment_id;

        var fields = ['_id', 'comments'];

        var user = null;
        //TODO: find a way to sort the comments
        async.waterfall([
            function (next) {
                //TODO optimize this query and only select _id and username
                UsersModel.findById(author_id, function (err, doc) {
                    //console.log('after UsersModel.findById', arguments);
                    if (err) {
                        next(utils.json.ServerError('error occured in mongodb : '+err));
                    } else if (!doc) {
                        next(utils.json.NotFound(author_id, 'User'));
                    } else {
                        next(null, doc);
                    }
                });
            },
            function (_user, next) {
                user = _user;
                //first get the post we want to comment
                var depthString = commentIdToDepthString(comment_id);
                var searchParams = {
                    _id: post_id
                };
                searchParams[depthString] = { $exists: true };
                PostsModel.findOne(searchParams, fields.join(' '),
                    function (err, post) {
                        if (err) {
                            next(utils.json.ServerError('err occurred in mongodb: '+err));
                        } else if (!post) {
                            next(utils.json.NotFound(comment_id, 'Comment'));
                        } else {
                            next(null, post);
                        }
                    });
            },
            function (post, next) {
                var parent_comment = commentIdToObject(post, comment_id);
                var new_comment_id = comment_id+'.'+parent_comment.replies.length;
                //console.log('POST new comment', comment_id, parent_comment, new_comment_id );
                var new_comment = {
                    _id: new_comment_id,
                    author: {
                        _id: user._id,
                        username: user.username
                    },
                    status: 'ok',
                    message: message,
                    votes: {
                        hotness: 0,
                        score: {
                            up: 1,
                            down: 0,
                            total: 1
                        },
                        ups: [user._id],
                        downs: []
                    },
                    replies: [],
                    created_at: new Date(),
                    updated_at: new Date()
                };
                new_comment.votes.hotness = ranking.hotness(new_comment);
                parent_comment.replies.push(new_comment);
                post.markModified(commentIdToDepthString(new_comment_id));
                post.save(function(err) {
                    if (err) {
                        next(utils.json.ServerError('error in mongodb:'+err));
                    } else {
                        var comment = commentIdToObject(post, new_comment_id);
                        //comment = comment.toObject();
                        delete comment.votes.ups;
                        delete comment.votes.downs;
                        //debugComment(post);
                        next(null, comment);
                    }
                });
            }

        ], function (err, comment) {
            if (err) {
                utils.respondJSON(res, err);
            } else {
                utils.respondJSON(res, utils.json.Ok({
                    comment: comment
                }));
            }
        });

    });

    router.delete('/:post_id/comments/:comment_id', auth.isAuthenticated(null, false), function (req, res) {
        //TODO: get author_id from session instead of user datas
        var user_id =  res.locals.user ? res.locals.user._id : req.body.data.user_id;

        var post_id = req.params.post_id;
        var comment_id = req.params.comment_id;

        var fields = ['_id', 'comments'];

        var user = null;
        async.waterfall([
            function (next) {
                //TODO optimize this query and only select _id and username
                UsersModel.findById(user_id, function (err, doc) {
                    //console.log('after UsersModel.findById', arguments);
                    if (err) {
                        next(utils.json.ServerError('error occured in mongodb : '+err));
                    } else if (!doc) {
                        next(utils.json.NotFound(user_id, 'User'));
                    } else {
                        next(null, doc);
                    }
                });
            },
            function (_user, next) {
                user = _user;
                //first get the post we want to comment
                var depthString = commentIdToDepthString(comment_id);
                var searchParams = {
                    _id: post_id
                };
                searchParams[depthString] = { $exists: true };
                PostsModel.findOne(searchParams, fields.join(' '),
                    function (err, post) {
                        if (err) {
                            next(utils.json.ServerError('err occurred in mongodb: '+err));
                        } else if (!post) {
                            next(utils.json.NotFound(comment_id, 'Comment'));
                        } else {
                            next(null, post);
                        }
                    });
            },
            function (post, next) {
                var parent_comment = commentIdToObject(post, comment_id);

                if (parent_comment.author._id.toString() !== user_id) {
                    return next(utils.json.BadRequest('User @'+user_id+' is not the author of this post'));
                }

                parent_comment.status = 'deleted';
                parent_comment.message = '';
                post.markModified(commentIdToDepthString(comment_id)+'.status');
                post.markModified(commentIdToDepthString(comment_id)+'.message');
                post.save(function(err) {
                    if (err) {
                        next(utils.json.ServerError('error in mongodb:'+err));
                    } else {
                        next(null);
                    }
                });
            }

        ], function (err, _) {
            if (err) {
                utils.respondJSON(res, err);
            } else {
                utils.respondJSON(res, utils.json.Ok());
            }
        });

    });

};
