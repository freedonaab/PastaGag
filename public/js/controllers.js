var pastagagControllers = angular.module('pastagagControllers', []);
//var pastagagServices = angular.module('pastagagServices', []);

pastagagControllers.controller('PostListCtrl', ['$scope', 'postService',
    function ($scope, postService) {
    }]);

//pastagagServices.service('postService', ['$scope', '$http',
//    function ($scope, postService) {
//    }]);

module.exports = pastagagControllers;