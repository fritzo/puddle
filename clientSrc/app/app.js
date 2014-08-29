'use strict';

var log = console.log.bind(console);
var angular = require('angular');
var uiRouter = require('angular-ui-router');
require('./corpus.js');


var puddle = angular.module('puddle', [uiRouter, 'corpus']);

puddle.config(function ($stateProvider, $urlRouterProvider) {
    // For any unmatched url, redirect to corpus
    $urlRouterProvider.otherwise('/corpus');
});


log('Puddle init complete.');