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

pastagagServices.factory('Comment', ['$resource',
    function($resource){
        return $resource('posts/:post_id/comments',
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
                },
                post: {
                    method: 'POST',
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

        AuthService.logout = function () {
            $http.post('/logout', { _csrf: csrf_token })
                .success(function() {
                    console.log('logout: SUCCESS');
                    $window.location.reload();
                })
                .error(function() {
                    console.log('logout: ERROR');
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
                .success(function () {
                    console.log('createPost: SUCCESS');
                    $window.location.reload();
                })
                .error(function () {
                    console.log('createPost: ERROR');
                });
            return AuthService.user != null;
        };

        AuthService.upvotePost = function (postId) {
            //TODO:
            //if (!AuthService.isLoggedIn())
            //    return;

            $http.post('/posts/' + postId + '/votes/up', {
                _csrf: csrf_token
            })
                .success(function() {
                    console.log('upvotePost: SUCCESS');
                })
                .error(function() {
                    console.log('upvotePost: ERROR');
                });
        };

        AuthService.downvotePost = function (postId) {
            //TODO:
            //if (!AuthService.isLoggedIn())
            //    return;

            $http.post('/posts/' + postId + '/votes/down', {
                _csrf: csrf_token
            })
                .success(function() {
                    console.log('downvotePost: SUCCESS');
                })
                .error(function() {
                    console.log('downvotePost: ERROR');
                });
        };

        return AuthService;
    }
]);
