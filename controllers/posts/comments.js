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

    router.post('/:post_id/comments/test1', function (req, res) {

        async.waterfall([
            function (next) {
                PostsModel.findById(req.params.post_id, next);
            },
            function (post, next) {
                post.comments.push({
                    user_id: req.params.post_id,
                    message: 'depth 0',
                    votes: {
                        score: {
                            up: 0,
                            down: 0,
                            total: 0
                        },
                        ups: [],
                        downs: []
                    },
                    replies: [],
                    created_at: new Date(),
                    updated_at: new Date()
                });
                post.comments[0].replies.push({
                    user_id: req.params.post_id,
                    message: 'depth 1',
                    votes: {
                        score: {
                            up: 0,
                            down: 0,
                            total: 0
                        },
                        ups: [],
                        downs: []
                    },
                    replies: [],
                    created_at: new Date(),
                    updated_at: new Date()
                });
                post.comments[0].replies[0].replies.push({
                    user_id: req.params.post_id,
                    message: 'depth 2',
                    votes: {
                        score: {
                            up: 0,
                            down: 0,
                            total: 0
                        },
                        ups: [],
                        downs: []
                    },
                    replies: [],
                    created_at: new Date(),
                    updated_at: new Date()
                });
                post.save(next);
            }
        ], function (err, _) {
            res.send('toto');
        });

    });

    router.get('/:post_id/comments/test_depth_0', function (req, res) {

        //0.0.0
        PostsModel.findOne({
            //'comments.0.message': 'depth 0'
            //'comments.0.replies.0.message': 'depth 1'
            //'comments.0.replies.0.replies.0.message': 'depth 3'

            //'comments.0': {
            //    $exists: true
            //}

            //'comments.0.replies.0': {
            //    $exists: true
            //}

            'comments.0.replies.0.replies.0': {
                $exists: true
            }

        }, function (err, _) {
            console.log('omg',arguments);
            res.send(_.toObject());
        });

    });
};
