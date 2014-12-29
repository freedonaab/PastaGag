'use strict';

module.exports = {

    Ok: function (datas, statusCode) {
        if (typeof statusCode === 'undefined') {
            statusCode = 200;
        }
        if (!datas) {
            datas = null;
        }
        return {
            metadata: {
                error: null,
                statusCode: statusCode,
                success: true
            },
            data: datas
        };
    },

    BadRequest: function (message) {
        return {
            metadata: {
                error: message,
                statusCode: 400,
                success: false
            },
            data: null
        };
    },

    NotFound: function (id, entity) {
        return {
            metadata: {
                error: entity+' with id @'+id+' was not found',
                statusCode: 404,
                success: false
            },
            data: null
        };
    },

    Unauthorized: function () {
        return {
            metadata: {
                error: 'Resource access unauthorized',
                statusCode: 401,
                success: false
            },
            data: null
        };
    },

    ServerError: function (message) {

        return {
            metadata: {
                error: message,
                statusCode: 500,
                success: false
            },
            data: null
        };

    }

};
