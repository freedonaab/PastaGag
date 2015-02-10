'use strict';

var pastagagControllers = angular.module('pastagagControllers', []);

pastagagControllers.controller('navbarController', ['$scope', '$location',
    function ($scope, $location) {
        $scope.isActive = function (viewLocation) {
            var path = $location.path().substr(0, 5);
            if (viewLocation === '/best' && path === '/best') {
                return true;
            }
            return viewLocation === $location.path();
        };
    }]);

pastagagControllers.controller('PostsListCtrl', ['$scope', 'Post', '$location',
    function ($scope, Post, $location) {
        var path = $location.path().substr(1);
        $scope.posts = Post.get({}, {param: path});

        $scope.upvote = function(postId) {
        };
        $scope.downvote = function(postId) {
        };
    }]);

pastagagControllers.controller('PostListCtrl', ['$scope', 'Post', '$routeParams',
    function ($scope, Post, $routeParams) {
        $scope.post = Post.get({param: $routeParams.id});
    }]);

module.exports = pastagagControllers;
