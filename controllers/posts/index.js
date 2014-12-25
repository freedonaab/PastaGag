'use strict';

var async = require('async');
var utils = require('../../lib/utils');
var urlCheck = require('../../lib/urlCheck');
var ranking = require('../../lib/ranking');

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

    router.get('/:post_id', function (req, res) {
        var post_id = req.params.post_id;

        if (!post_id) {
            return utils.respondJSON(res, utils.json.BadRequest('url param post_id is required'));
        }

        PostsModel.findById(post_id, function (err, post) {
            if (err) {
                utils.respondJSON(res, utils.json.ServerError('err occurred in mongodb: '+err));
            } else if (!post) {
                utils.respondJSON(res, utils.json.NotFound(post_id, 'Post'));
            } else {
                utils.respondJSON(res, utils.json.Ok({ post: post }));
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

        console.log('POST /posts', post_datas);

        var post = new PostsModel();

        async.waterfall([
            function (next) {
                //check if author_id exists
                UsersModel.findById(post_datas.author_id, function (err, doc) {
                    //console.log('after UsersModel.findById', arguments);
                    if (err || !doc) {
                        next(utils.json.NotFound(post_datas.author_id, 'User'));
                    } else {
                        next(null);
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


    router.post('/:post_id/votes/down', function (req, res) {
        var post_id = req.params.post_id;
        var user_id = req.body.data.user_id;

        if (!post_id) {
            return utils.respondJSON(res, utils.json.BadRequest('url param post_id is required'));
        }

        if (!user_id) {
            return utils.respondJSON(res, utils.json.BadRequest('field user_id is required'));
        }

        async.waterfall([
            function (next) {
                //check if document exists
                //console.log('POST DOWNVOTE', 'step1: check if document exists');
                PostsModel.findById(post_id, '_id', function (err, post) {
                    if (err) {
                        //console.log('POST DOWNVOTE', 'step1: err in mongo');
                        utils.respondJSON(res, utils.json.ServerError('err occurred in mongodb: '+err));
                    } else if (!post) {
                        //console.log('POST DOWNVOTE', 'step1: post not found');
                        utils.respondJSON(res, utils.json.NotFound(post_id, 'Post'));
                    } else {
                        //console.log('POST DOWNVOTE', 'step1: all good');
                        next(null, post);
                    }
                });
            },

            function (post, next) {
                //check if user has voted this post up
                //console.log('POST DOWNVOTE', 'step2: check if user has voted this post up');
                var query = PostsModel.findOne({_id: post_id, 'votes.ups': user_id});
                query.select('_id created_at votes.hotness votes.score');
                query.exec(next);
            },
            function (up_post, next) {
                //if there is an upvote, remove it
                //console.log('POST DOWNVOTE', 'step3: if there is an upvote, remove it', up_post);
                if (up_post) {
                    //console.log('POST DOWNVOTE', 'step3: there was an upvote, removing it');
                    up_post.votes.score.up = up_post.votes.score.up - 1;
                    up_post.votes.score.total =  up_post.votes.score.total - 1;
                    up_post.votes.hotness =  ranking.hotness(up_post);
                    PostsModel.update({ _id: post_id }, {
                        $pull: {
                            'votes.ups': user_id
                        },
                        $set: {
                            'votes.score.down': up_post.votes.score.down,
                            'votes.score.up': up_post.votes.score.up,
                            'votes.score.total': up_post.votes.score.total,
                            'votes.hotness': up_post.votes.hotness
                        }
                    }).exec(next);
                } else {
                    //console.log('POST DOWNVOTE', 'step3: no upvote');
                    next(null, {}, {});
                }
            },
            function (_, _1, next) {
                //check if user has voted this post down
                //console.log('POST DOWNVOTE', 'step4: check if user has voted this post down', arguments);
                var query = PostsModel.findOne({_id: post_id, 'votes.downs': user_id});
                query.select('_id votes.hotness votes.score');
                query.exec(next);
            },
            function (down_post, next) {
                //if there is no downvote, then downvote it
                //console.log('POST DOWNVOTE', 'step5: if there is no downvote, then downvote it');
                if (down_post) {
                    //console.log('POST DOWNVOTE', 'step5: there was already a downvote, error!');
                    next(utils.json.BadRequest('user already downvoted this post'));
                } else {
                    next(null);
                }
            },
            function (next) {
                //get the post again
                //console.log('POST DOWNVOTE', 'step6: get the post again!');
                var query = PostsModel.findOne({_id: post_id});
                query.select('_id votes.hotness votes.score created_at');
                query.exec(next);
            },
            function (down_post, next) {
                //console.log('POST DOWNVOTE', 'step7: there was no downvote, doing it!', down_post);
                down_post.votes.score.down = down_post.votes.score.down + 1;
                down_post.votes.score.total =  down_post.votes.score.total - 1;
                down_post.votes.hotness =  ranking.hotness(down_post);
                PostsModel.update({ _id: post_id }, {
                    $push: {
                        'votes.downs': user_id
                    },
                    $set: {
                        'votes.score.down': down_post.votes.score.down,
                        'votes.score.up': down_post.votes.score.up,
                        'votes.score.total': down_post.votes.score.total,
                        'votes.hotness': down_post.votes.hotness
                    }
                }).exec(next);
            }
        ], function (err, _res) {
            if (err) {
                if (!err.metadata) {
                    err = utils.json.ServerError(err);
                }
                utils.respondJSON(res, err);
            } else {
                utils.respondJSON(res, utils.json.Ok({}));
            }
        });

    });

    router.post('/:post_id/votes/up', function (req, res) {
        var post_id = req.params.post_id;
        var user_id = req.body.data.user_id;

        if (!post_id) {
            return utils.respondJSON(res, utils.json.BadRequest('url param post_id is required'));
        }

        if (!user_id) {
            return utils.respondJSON(res, utils.json.BadRequest('field user_id is required'));
        }

        async.waterfall([
            function (next) {
                //check if document exists
                //console.log('POST UPVOTE', 'step1: check if document exists');
                PostsModel.findById(post_id, '_id', function (err, post) {
                    if (err) {
                        //console.log('POST UPVOTE', 'step1: err in mongo');
                        utils.respondJSON(res, utils.json.ServerError('err occurred in mongodb: '+err));
                    } else if (!post) {
                        //console.log('POST UPVOTE', 'step1: post not found');
                        utils.respondJSON(res, utils.json.NotFound(post_id, 'Post'));
                    } else {
                        //console.log('POST UPVOTE', 'step1: all good');
                        next(null, post);
                    }
                });
            },

            function (post, next) {
                //check if user has voted this post up
                //console.log('POST UPVOTE', 'step2: check if user has voted this post down');
                var query = PostsModel.findOne({_id: post_id, 'votes.downs': user_id});
                query.select('_id votes.hotness votes.score created_at');
                query.exec(next);
            },
            function (down_post, next) {
                //if there is an upvote, remove it
                //console.log('POST UPVOTE', 'step3: if there is an downvote, remove it', down_vote);
                if (down_post) {
                    //console.log('POST UPVOTE', 'step3: there was an downvote, removing it');
                    down_post.votes.score.down = down_post.votes.score.down - 1;
                    down_post.votes.score.total =  down_post.votes.score.total + 1;
                    down_post.votes.hotness =  ranking.hotness(down_post);
                    PostsModel.update({ _id: post_id }, {
                        $pull: {
                            'votes.downs': user_id
                        },
                        $set: {
                            'votes.score.down': down_post.votes.score.down,
                            'votes.score.up': down_post.votes.score.up,
                            'votes.score.total': down_post.votes.score.total,
                            'votes.hotness': down_post.votes.hotness
                        }
                    }).exec(next);
                } else {
                    //console.log('POST UPVOTE', 'step3: no downvote');
                    next(null, {}, {});
                }
            },
            function (_, _1, next) {
                //check if user has voted this post up
                //console.log('POST UPVOTE', 'step4: check if user has voted this post up', arguments);
                var query = PostsModel.findOne({_id: post_id, 'votes.ups': user_id});
                query.select('_id votes.hotness votes.score');
                query.exec(next);
            },
            function (up_post, next) {
                //if there is no UPVOTE, then UPVOTE it
                //console.log('POST UPVOTE', 'step5: if there is no UPVOTE, then UPVOTE it');
                if (up_post) {
                    //console.log('POST UPVOTE', 'step5: there was already a UPVOTE, error!');
                    next(utils.json.BadRequest('user already upvoted this post'));
                } else {
                    next(null);
                }
            },
            function (next) {
                //get the post again
                //console.log('POST UPVOTE', 'step6: get the post again!');
                var query = PostsModel.findOne({_id: post_id});
                query.select('_id votes.hotness votes.score created_at');
                query.exec(next);
            },
            function (up_post, next) {
                //console.log('POST UPVOTE', 'step7: there was no UPVOTE, doing it!', up_post);
                up_post.votes.score.up = up_post.votes.score.up + 1;
                up_post.votes.score.total =  up_post.votes.score.total + 1;
                up_post.votes.hotness =  ranking.hotness(up_post);
                PostsModel.update({ _id: post_id }, {
                    $push: {
                        'votes.ups': user_id
                    },
                    $set: {
                        'votes.score.down': up_post.votes.score.down,
                        'votes.score.up': up_post.votes.score.up,
                        'votes.score.total': up_post.votes.score.total,
                        'votes.hotness': up_post.votes.hotness
                    }
                }).exec(next);
            }
        ], function (err, _res) {
            if (err) {
                if (!err.metadata) {
                    err = utils.json.ServerError(err);
                }
                utils.respondJSON(res, err);
            } else {
                utils.respondJSON(res, utils.json.Ok({}));
            }
        });

    });


};
