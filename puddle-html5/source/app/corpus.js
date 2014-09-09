'use strict';


var log = require('debug')('puddle:client:corpus');
var angular = require('angular');
var _ = require('lodash');
var uiRouter = require('angular-ui-router');
var corpus = angular.module('corpus', [uiRouter, 'btford.socket-io']);

corpus.config(function ($stateProvider) {
    $stateProvider
        .state('corpus', {
            url: '/corpus',
            templateUrl: 'corpus.html',
            controller: 'corpus'
        });
});

corpus.factory('Socket', function (socketFactory) {
    return socketFactory();
});

corpus.controller('corpus', function ($scope, CorpusDB) {
    $scope.corpus = CorpusDB.corpus;
});

corpus.factory('CorpusDB', function (Socket) {
    var codes = [];
    Socket.on('corpus', function (method, args) {
        switch (method) {
            case 'findAll':
                var corpus = args[0];
                if (_.isArray(corpus)) {
                    codes.length = 0;
                    corpus.forEach(function (a) {
                        codes.push(a);
                    });
                }
                break;
        }
    });

    return {corpus: codes};
});

log('Corpus module init complete');

