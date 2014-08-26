'use strict';
var angular = require('angular');
var uiRouter = require('angular-ui-router');
var corpus = angular.module('corpus', [uiRouter]);

corpus.config(function ($stateProvider) {
	$stateProvider
		.state('corpus', {
			url: '/corpus',
			templateUrl: 'corpus.html',
			controller: 'corpus'
		});
});

corpus.controller('corpus', function ($scope) {
	$scope.corpus =['1','2'];
});

