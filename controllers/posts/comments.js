'use strict';

var moment = require('moment');
var async = require('async');
var _ = require('underscore');
var utils = require('../../lib/utils');
var urlCheck = require('../../lib/urlCheck');
var ranking = require('../../lib/ranking');

var PostsModel = require('../../models/posts');
var UsersModel = require('../../models/users');

module.exports = function (router) {


    //router.post('/:post_id/comments/'); //-> reply to post :post_id
    //router.post('/:post_id/comments/:comment_id'); //-> reply to comment :comment_id on post :post_id
    //router.del('/:post_id/comments/:comment_id'); //-> delete comment :comment_id on post :post_id

    router.post('/:post_id/comments', function (req, res) {

        var post_id = req.params.post_id;

        //TODO: get author_id from session instead of user datas
        var author_id = req.body.data.author_id;
        var message = req.body.data.message;
        if (!message) {
            return utils.respondJSON(res, utils.json.badRequest('field mesage is required'));
        }

        var fields = ['_id', 'comments'];

        async.waterfall([
            function (next) {
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
                    author_id: author_id,
                    message: message,
                    votes: {
                        hotness: 0,
                        score: {
                            up: 1,
                            down: 0,
                            total: 1
                        },
                        ups: [author_id],
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

    router.post('/:post_id/comments/:comment_id', function (req, res) {

        var post_id = req.params.post_id;

        //TODO: get author_id from session instead of user datas
        var author_id = req.body.data.author_id;
        var message = req.body.data.message;
        if (!message) {
            return utils.respondJSON(res, utils.json.badRequest('field mesage is required'));
        }

        var comment_id = req.params.comment_id;

        var fields = ['_id', 'comments'];

        //TODO: find a way to sort the comments
        async.waterfall([
            function (next) {
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
                    author_id: author_id,
                    message: message,
                    votes: {
                        hotness: 0,
                        score: {
                            up: 1,
                            down: 0,
                            total: 1
                        },
                        ups: [author_id],
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

    //router.get('/:post_id/comments/test_depth_0', function (req, res) {
    //
    //    //0.0.0
    //    PostsModel.findOne({
    //        //'comments.0.message': 'depth 0'
    //        //'comments.0.replies.0.message': 'depth 1'
    //        //'comments.0.replies.0.replies.0.message': 'depth 3'
    //
    //        //'comments.0': {
    //        //    $exists: true
    //        //}
    //
    //        //'comments.0.replies.0': {
    //        //    $exists: true
    //        //}
    //
    //        'comments.0.replies.0.replies.0': {
    //            $exists: true
    //        }
    //
    //    }, function (err, _) {
    //        res.send(_.toObject());
    //    });
    //
    //});
};
