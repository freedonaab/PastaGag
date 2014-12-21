'use strict';

var async = require('async');
var utils = require('../../lib/utils');

var PostsModel = require('../../models/posts');
var UsersModel = require('../../models/users');


module.exports = function (router) {

    router.get('/', function (req, res) {
        PostsModel.find(function (err, posts) {
            if (err) {
                utils.respondJSON(res, utils.json.ServerError('err occurred in mongodb: '+err));
            } else {
                utils.respondJSON(res, utils.json.Ok({ posts: posts }));
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

        console.log('POST /posts', post_datas);

        var post = new PostsModel();

        async.waterfall([
            function (next) {
                UsersModel.findById(post_datas.author_id, function (err, doc) {
                    console.log('after UsersModel.findById', arguments);
                    if (err || !doc) {
                        next('not found');
                    } else {
                        next();
                    }
                });
            },
            function (next) {

                post.title = post_datas.title;
                post.content = post_datas.content;
                post.content_type = post_datas.content_type;
                post.author_id = post_datas.author_id;

                post.customCreate(next);
            }
        ], function (err) {
            if (err) {
                utils.respondJSON(res, utils.json.ServerError('error occured in mongodb: '+err));
            } else {
                utils.respondJSON(res, utils.json.Ok({post: post}));
            }
        });

        //var post = new PostsModel();
        //
        //user.email = user_datas.email;
        //user.username = user_datas.username;
        //user.password = user_datas.password;
        //
        //user.customCreate(function (err) {
        //    if (err) {
        //        utils.respondJSON(res, utils.json.ServerError('error occured in mongodb: '+err));
        //    } else {
        //        utils.respondJSON(res, utils.json.Ok({user: user}));
        //    }
        //});

    });
};
