'use strict';

var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

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

//UserSchema.methods.customCreate = function (cb) {
//    // console.log('in customCreate ', this.save);
//    this.created_at = new Date();
//    this.updated_at = new Date();
//    this.language = 'en_US';
//    this.description = this.description || '';
//    this.profile_picture = this.profile_picture || '';
//    this.save(cb);
//};


//UserSchema.methods.toto = ...

var PostModel = mongoose.model('Post', PostSchema);

module.exports = PostModel;
