'use strict';

var mongoose = require('mongoose');
var connection = require('../lib/database').connection;
var ranking = require('../lib/ranking');

var ObjectId = mongoose.Schema.Types.ObjectId;

connection = mongoose;

var CommentSchema = new mongoose.Schema({
    user_id: ObjectId,
    message: String,
    votes: {
        score: {
            up: Number,
            down: Number,
            total: Number
        },
        ups: [ObjectId],
        downs: [ObjectId]
    },
    replies: [CommentSchema],
    created_at: Date,
    updated_at: Date
});

var PostSchema = new mongoose.Schema({
    title: String,
    content: String,
    content_type: String,
    author_id: ObjectId,
    status: String,
    votes: {
        hotness: Number,
        score: {
            up: Number,
            down: Number,
            total: Number
        },
        ups: [ObjectId],
        downs: [ObjectId]
    },
    comments: [CommentSchema],
    created_at: Date,
    updated_at: Date
});

PostSchema.methods.customCreate = function (cb) {
    this.status = 'ok';
    this.votes = {
        hotness: 0,
        score: {
            up: 1,
            down: 0,
            total: 1
        },
        ups: [this.author_id],
        down:[]
    };
    this.comments = [];
    this.created_at = new Date();
    this.updated_at = new Date();
    this.votes.hotness = ranking.hotness(this);
    this.save(cb);
};

//UserSchema.methods.toto = ...

var PostModel = mongoose.model('Post', PostSchema);

module.exports = PostModel;
