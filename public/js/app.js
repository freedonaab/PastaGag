'use strict';

require('../components/angular');
require('../components/angular-route');

var pastagagControllers = require('./controllers');


var pastagagApp = angular.module('pastagagApp', [
    'ngRoute',
    'pastagagControllers',
    'ui.bootstrap'
]);

pastagagApp.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
            when('/posts', {
                templateUrl: 'layouts/master.dust',
                controller: 'PostsListCtrl'
            }).
            when('/posts/:id', {
                templateUrl: 'layouts/master.dust',
                controller: 'PostsListCtrl'
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