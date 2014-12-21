'use strict';

var mongoose = require('mongoose');
var connection = require('../lib/database').connection;
var ObjectId = mongoose.Schema.Types.ObjectId;

connection = mongoose;

var PostSchema = new mongoose.Schema({
    title: String,
    content: String,
    content_type: String,
    author_id: ObjectId,
    status: String,
    votes: {
        score: {
            up: Number,
            down: Number,
            total: Number
        },
        ups: [String],
        downs: [String]
    },
    comments: [{
        user_id: ObjectId,
        message: String,
        votes: {
            score: {
                up: Number,
                down: Number,
                total: Number
            },
            ups: [String],
            downs: [String]
        },
        created_at: Date,
        updated_at: Date
    }],
    created_at: Date,
    updated_at: Date
});

PostSchema.methods.customCreate = function (cb) {
    this.status = 'ok';
    this.votes = {
        score: {
            up: 0,
            down: 0,
            total: 0
        },
        ups: [this.author_id],
        down:[]
    };
    this.comments = [];
    this.created_at = new Date();
    this.updated_at = new Date();
    this.save(cb);
};


//UserSchema.methods.toto = ...

var PostModel = mongoose.model('Post', PostSchema);

module.exports = PostModel;
