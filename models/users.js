'use strict';

var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    email: String,
    username: String,
    password: String,
    profile_picture: String,
    description: String,
    created_at: Date,
    updated_at: Date,
    language: String
});

UserSchema.methods.customCreate = function (cb) {
   // console.log('in customCreate ', this.save);
    this.created_at = new Date();
    this.updated_at = new Date();
    this.language = 'en_US';
    this.description = this.description || '';
    this.profile_picture = this.profile_picture || '';
    this.save(cb);
};

UserSchema.methods.passwordMatches = function (password) {
    return this.password === password;
};

//UserSchema.methods.toto = ...

var UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;
