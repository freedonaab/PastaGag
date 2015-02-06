var pastagagControllers = angular.module('pastagagControllers', []);
//var pastagagServices = angular.module('pastagagServices', []);

pastagagControllers.controller('PostListCtrl', ['$scope', '$http',
    function ($scope, $http) {
        $http.get('posts/').success(function(data) {
            $scope.posts = data.data.posts;
        });
    }]);

//pastagagServices.service('postService', ['$scope', '$http',
//    function ($scope, postService) {
//    }]);

module.exports = pastagagControllers;
