'use strict';

require('../components/angular');
require('../components/angular-route');
require('../components/angular-bootstrap/ui-bootstrap');
require('../components/angular-resource');

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
                templateUrl: 'templates/angular/posts.dust',
                controller: 'PostsListCtrl'
            }).
            when('/hot', {
                templateUrl: 'templates/angular/posts.dust',
                controller: 'PostsListCtrl'
            }).
            when('/new', {
                templateUrl: 'templates/angular/posts.dust',
                controller: 'PostsListCtrl'
            }).
            when('/best', {
                templateUrl: 'templates/angular/posts.dust',
                controller: 'PostsListCtrl'
            }).
            when('/best/ever', {
                templateUrl: 'templates/angular/posts.dust',
                controller: 'PostsListCtrl'
            }).
            when('/best/month', {
                templateUrl: 'templates/angular/posts.dust',
                controller: 'PostsListCtrl'
            }).
            when('/best/week', {
                templateUrl: 'templates/angular/posts.dust',
                controller: 'PostsListCtrl'
            }).
            when('/best/day', {
                templateUrl: 'templates/angular/posts.dust',
                controller: 'PostsListCtrl'
            }).
            when('/posts/:id', {
                templateUrl: 'templates/angular/post.dust',
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

