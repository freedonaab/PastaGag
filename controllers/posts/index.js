'use strict';

var async = require('async');
var utils = require('../../lib/utils');
var urlCheck = require('../../lib/urlCheck');

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
                //check if author_id exists
                UsersModel.findById(post_datas.author_id, function (err, doc) {
                    //console.log('after UsersModel.findById', arguments);
                    if (err || !doc) {
                        next('not found');
                    } else {
                        next();
                    }
                });
            },
            function (next) {
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
                post.author_id = post_datas.author_id;
                post.content_type = content_type;

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
};
