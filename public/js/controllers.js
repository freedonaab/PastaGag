'use strict';

var pastagagControllers = angular.module('pastagagControllers', []);

var _ = require("lodash");
console.log('lodash !!');
console.log(_);

pastagagControllers.controller('navbarController', ['$scope', '$location',
    function ($scope, $location) {
        $scope.isActive = function (viewLocation) {
            var path = $location.path().substr(0, 5);
            if (viewLocation === '/best' && path === '/best') {
                return true;
            }
            return viewLocation === $location.path();
        };

        $scope.showModal = false;
        $scope.openUploadModal = function(){
            $scope.showModal = !$scope.showModal;
        };
    }]);

pastagagControllers.controller('PostsListCtrl', ['$scope', 'Post', '$location',
    function ($scope, Post, $location) {
        var path = $location.path().substr(1);
        $scope.posts = Post.list({}, {param: path});

        $scope.upvote = function(postId) {
        };
        $scope.downvote = function(postId) {
        };
    }]);

pastagagControllers.controller('PostListCtrl', ['$scope', '$http', 'Post', '$routeParams',
    function ($scope, $http, Post, $routeParams) {
        $scope.post = Post.get({param: $routeParams.id});

        $scope.upvote = function(postId) {
        };
        $scope.downvote = function(postId) {
        };
        $scope.postComment = function(postId) {
            var comment = angular.element('#comment').val();
            if (comment !== "") {
                $http.post('posts/' + postId + '/comments', comment).success(function(data) {
                    $scope.phones = data;
                });
            }
        };
    }]);

module.exports = pastagagControllers;
