'use strict';

var json = require('./json');

module.exports = {

    respondJSON: function (res, message) {
        var statusCode = 200;
        if (message.metadata && message.metadata.statusCode) {
            statusCode = message.metadata.statusCode;
        }
        res.status(statusCode).send(message);
    },

    json: json


};
