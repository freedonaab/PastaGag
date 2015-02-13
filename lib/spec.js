'use strict';


var db = require('./database');
var fixtures = require('./fixtures');

var passport = require('passport');
var auth = require('./auth');
var User = require('../models/users');

module.exports = {

    onconfig: function (config, next) {
        config.set('env:env', process.env.NODE_ENV || 'development');
        db.config(config.get('database'));
        fixtures.config(config.get('database'), config.get('fixtures_path'));


        next(null, config);
    }

};


