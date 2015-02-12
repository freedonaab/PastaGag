'use strict';

var pastagagServices = angular.module('pastagagServices', ['ngResource']);

pastagagServices.factory('Post', ['$resource',
    function($resource){
        return $resource('posts/:param',
            {param: "@param"},
            {
                list: {
                    method: 'GET',
                    params: {},
                    transformResponse: function (data) {return angular.fromJson(data).data.posts},
                    isArray: true
                },
                get: {
                    method: 'GET',
                    params: {},
                    transformResponse: function (data) {return angular.fromJson(data).data.post},
                    isArray: false
                }
            });
}]);


pastagagServices.factory('Auth', [ '$http', '$location', '$window',
    function ($http, $location, $window) {
        var AuthService = {};

        AuthService.user = null;

        AuthService.isLoggedIn = function () {
            return AuthService.user != null;
        };

        AuthService.login = function (username, password) {
            $http.post('/login', { username: username, password: password, _csrf: csrf_token })
                .success(function() {
                    console.log('login: SUCCESS');
                    $window.location.reload();
                })
                .error(function() {
                    console.log('login: ERROR');
                });
        };

        AuthService.createPost = function (post) {
            //TODO:
            //if (!AuthService.isLoggedIn())
            //    return;

            $http.post('/posts', {
                data: { post: post },
                _csrf: csrf_token
            })
                .success(function() {
                    console.log('createPost: SUCCESS');
                    $window.location.reload();
                })
                .error(function() {
                    console.log('createPost: ERROR');
                });


//     $scope.save = function (post) {
//        if ($scope.newPostForm.$valid) {
//            post.author_id = "54d4c9c11771a63013614f76";
//            $http.post('posts/', { post: post })
//                .success(function() {
//                    $modalInstance.close();
//                });
//        }


            return AuthService.user != null;
        };

        return AuthService;
    }
]);
