'use strict';

var mongoose = require('mongoose');

module.exports = {

    config: function (options) {
        if (options.type && options.type === 'mongodb') {
            options = options[options.type];
        }
        mongoose.connect('mongodb://'+options.host+':'+options.port+'/'+options.database);
        console.log('mongodb connection', options, this);
    }
};
