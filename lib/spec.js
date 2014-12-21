'use strict';


var db = require('./database');

module.exports = {

    onconfig: function (config, next) {
        db.config(config.get('database').development);
        next(null, config);
    }

};
