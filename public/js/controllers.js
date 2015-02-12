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

        $scope.openUploadModal = function (size) {

            var modalInstance = $modal.open({
                templateUrl: 'uploadModalContent',
                controller: 'ModalInstanceController',
                size: size,
                resolve: {
                    items: function () {
                        return $scope.items;
                    }
                },
                backdrop: true
            });

            modalInstance.result.then(function (modalScope) {
                console.log(modalScope);
                Auth.createPost(modalScope.post);
            }, function () {
            });
        };

        $scope.openLoginModal = function (size) {

            var modalInstance = $modal.open({
                templateUrl: 'loginModalContent',
                controller: 'ModalInstanceController',
                size: size,
                resolve: {
                    items: function () {
                        return $scope.items;
                    }
                },
                backdrop: true
            });

            modalInstance.result.then(function (modalScope) {
                console.log(modalScope);
                console.log(modalScope.username);
                console.log(modalScope.password);
                Auth.login(modalScope.username, modalScope.password);
            }, function () {
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

pastagagControllers.controller('ModalInstanceController', function ($scope, $modalInstance, $http) {

    $scope.username = "";
    $scope.password = "";

    $scope.ok = function () {
        $modalInstance.close($scope);

    };

    $scope.dismiss = function () {
        $modalInstance.dismiss('cancel');
    };
});

module.exports = pastagagControllers;
