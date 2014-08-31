'use strict';

//This is an entry point into application.
//App consists of folowing modules:
//Corpus - corpus binding REST/Socket <=> HTML DOM + updates from either side.
//Logger -
//Navigator -


var log = console.log.bind(console);
var angular = require('angular');
var uiRouter = require('angular-ui-router');

//this will register ng-modules into angular namespace.
require('./corpus.js');


//require all modules.
var puddle = angular.module('puddle', [uiRouter, 'corpus']);

//Define default route where to redirect all unknown URL's
//Outher routes defined witin other modules.
puddle.config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/corpus');
});


log('Puddle init complete.');