'use strict';


var db = require('./database');


module.exports = {

    onconfig: function (config, next) {

        config.set('env:env', 'development');
        db.config(config.get('database'));
        next(null, config);
    }

};
