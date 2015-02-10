'use strict';

var pastagagServices = angular.module('pastagagServices', ['ngResource']);

pastagagServices.factory('Post', ['$resource',
    function($resource){
        return $resource('posts/:param',
            {param: "@param"},
            {
                get: {
                    method: 'GET',
                    params: {},
                    transformResponse: function (data) {return angular.fromJson(data).data.posts},
                    isArray: true
                }
            });
    }]);
