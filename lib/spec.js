'use strict';


var db = require('./database');
var fixtures = require('./fixtures');

module.exports = {

    onconfig: function (config, next) {

        config.set('env:env', 'development');
        db.config(config.get('database'));
        fixtures.config(config.get('database'), config.get('fixtures_path'));
        next(null, config);
    }

};
