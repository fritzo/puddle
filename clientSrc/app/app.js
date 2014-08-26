'use strict';

var log = console.log.bind(console);
var angular = require('angular');
var uiRouter = require('angular-ui-router');
var puddle = angular.module('puddle', [uiRouter]);


puddle.config(function ($stateProvider, $urlRouterProvider) {
	//
	// For any unmatched url, redirect to /state1
	$urlRouterProvider.otherwise('/puddle');
	//
	// Now set up the states
	$stateProvider
		.state('puddle', {
			url: '/puddle',
			templateUrl: 'puddle.html'
		})
		.state('puddle.list', {
			url: '/list',
			templateUrl: 'puddle.list.html',
			controller: function ($scope) {
				$scope.items = ['A', 'List', 'Of', 'Items'];
			}
		})
		.state('d3', {
			url: '/d3',
			templateUrl: 'd3.html'
		})
		.state('d3.list', {
			url: '/list',
			templateUrl: 'd3.list.html',
			controller: function ($scope) {
				$scope.things = ['A', 'Set', 'Of', 'Things'];
			}
		});
});
log('Puddle init complete.');