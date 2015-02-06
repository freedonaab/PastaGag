'use strict';

require('../components/angular');
require('../components/angular-route');
require('../components/angular-bootstrap/ui-bootstrap');
require('../components/angular-masonry/angular-masonry')

var pastagagControllers = require('./controllers');

var pastagagApp = angular.module('pastagagApp', [
    'ngRoute',
    'pastagagControllers',
    'ui.bootstrap',
    'wu.masonry'
]);

pastagagApp.config(['$routeProvider',
    function($routeProvider) {

        $routeProvider.
            when('/', {
                templateUrl: 'templates/angular/index.dust',
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
