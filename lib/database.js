'use strict';

var mongoose = require('mongoose');

module.exports = {

    config: function (options) {
        if (options.type && options.type === 'mongodb') {
            options = options[options.type];
        }
        var url;
        if (options.url)
            url = options.url
        else
            url = 'mongodb://'+options.host+':'+options.port+'/'+options.database
        mongoose.connect(url);
        console.log('mongodb connection', options, this);
    }
};
