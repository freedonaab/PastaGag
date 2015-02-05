'use strict';

require('../components/angular');
require('../components/angular-route');
require('../components/angular-bootstrap/ui-bootstrap');

var pastagagControllers = require('./controllers');

var pastagagApp = angular.module('pastagagApp', [
    'ngRoute',
    'pastagagControllers',
    'ui.bootstrap'
]);

pastagagApp.config(['$routeProvider',
    function($routeProvider) {

        // $routeProvider.
        //     when('/posts', {
        //         templateUrl: 'layouts/posts.dust'
        //     });


        $routeProvider.
            when('/posts', {
                templateUrl: 'templates/angular/posts.dust',
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
