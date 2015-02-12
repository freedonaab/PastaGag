'use strict';

require('../components/angular');
require('../components/angular-route');
require('../components/angular-bootstrap/ui-bootstrap');
require('../components/angular-bootstrap/ui-bootstrap-tpls');
require('../components/angular-resource');
var _ = require("../components/lodash/lodash.js");

var pastagagControllers = require('./controllers');
var pastagagServices = require('./services');

var pastagagApp = angular.module('pastagagApp', [
    'ngRoute',
    'pastagagControllers',
    'pastagagServices',
    'ui.bootstrap'
]);

pastagagApp.config(['$routeProvider',
    function($routeProvider) {

        $routeProvider.
            when('/', {
                templateUrl: 'templates/posts.dust',
                controller: 'PostsListCtrl'
            }).
            when('/hot', {
                templateUrl: 'templates/posts.dust',
                controller: 'PostsListCtrl'
            }).
            when('/new', {
                templateUrl: 'templates/posts.dust',
                controller: 'PostsListCtrl'
            }).
            when('/best', {
                templateUrl: 'templates/posts.dust',
                controller: 'PostsListCtrl'
            }).
            when('/best/ever', {
                templateUrl: 'templates/posts.dust',
                controller: 'PostsListCtrl'
            }).
            when('/best/month', {
                templateUrl: 'templates/posts.dust',
                controller: 'PostsListCtrl'
            }).
            when('/best/week', {
                templateUrl: 'templates/posts.dust',
                controller: 'PostsListCtrl'
            }).
            when('/best/day', {
                templateUrl: 'templates/posts.dust',
                controller: 'PostsListCtrl'
            }).
            when('/posts/:id', {
                templateUrl: 'templates/post.dust',
                controller: 'PostListCtrl'
            }).
            when('/account', {
                templateUrl: 'layouts/master.dust',
                controller: 'PostsListCtrl'
            }).
            when('/login', {
                templateUrl: 'layouts/master.dust',
                controller: 'PostsListCtrl'
            }).
            otherwise({
                redirectTo: '/'
            });
    }]);

