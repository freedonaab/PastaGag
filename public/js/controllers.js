'use strict';

var pastagagControllers = angular.module('pastagagControllers', []);

pastagagControllers.controller('navbarController', ['$scope', '$location', '$modal', 'Auth',
    function ($scope, $location, $modal, Auth) {
        $scope.isActive = function (viewLocation) {
            var path = $location.path().substr(0, 5);
            if (viewLocation === '/best' && path === '/best') {
                return true;
            }
            return viewLocation === $location.path();
        };

        var uploadModalInstance =

        $scope.openUploadModal = function (size) {

            var modalInstance = $modal.open({
                templateUrl: (isAuthenticated ? 'UploadModalTemplate' : 'LoginModalTemplate'),
                controller: (isAuthenticated ? 'UploadModalController' : 'LoginModalController'),
                size: size,
                resolve: {
                    items: function () {
                        return $scope.items;
                    }
                },
                backdrop: true
            });
        };

        $scope.openLoginModal = function (size) {

            var modalInstance = $modal.open({
                templateUrl: 'LoginModalTemplate',
                controller: 'LoginModalController',
                size: size,
                resolve: {
                    items: function () {
                        return $scope.items;
                    }
                },
                backdrop: true
            });
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
                $http.post('posts/' + postId + '/comments',
                    {
                        message: comment
                    }
                )
                    .success(function(data) {
                        $scope.phones = data;
                    });
            }
        };
    }]);

pastagagControllers.controller('UploadModalController', function ($scope, $modalInstance, Auth) {
    $scope.ok = function(post) {
        if ($scope.newPostForm.$valid) {
            Auth.createPost(post);
            $modalInstance.close();
        }
    };

    $scope.dismiss = function () {
        $modalInstance.dismiss('cancel');
    };
});

pastagagControllers.controller('LoginModalController', function ($scope, $modalInstance, Auth) {
    $scope.ok = function(user) {
        if ($scope.loginForm.$valid) {
            Auth.login(user.username, user.password);
            $modalInstance.close();
        }
    };

    $scope.dismiss = function () {
        $modalInstance.dismiss('cancel');
    };
});

module.exports = pastagagControllers;
