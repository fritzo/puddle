'use strict';


var debug = require('debug')('puddle:html5:corpus');
var angular = require('angular');
var io = require('socket.io-client');
var hub = require('puddle-hub').client(io);
debug('Client hub crud id', hub.nodeId);
var uiRouter = require('angular-ui-router');
var uuid = require('node-uuid');
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

corpus.controller('corpus', function ($scope, Corpus) {
    $scope.corpus = Corpus;
    $scope.create = Corpus.create;
});

corpus.factory('Corpus', function ($timeout) {
    var Corpus = {
        corpus: {'1': 'Empty'},
        create: function (obj) {
            debug('Angular create');
            var id = uuid();
            hub.create(id, obj);
        }
    };

    hub.on('reset', function (state) {
        debug('Reset received with', state);
        $timeout(function () {
            Corpus.corpus = state;
        }, 0);
    });

    hub.on('create', function (id, obj) {
        debug('create received', id, obj);
        $timeout(function () {
            Corpus.corpus[id] = obj;
        }, 0);
    });

    hub.on('remove', function (id) {
        debug('remove received', id);
        $timeout(function () {
            delete Corpus.corpus[id];
        }, 0);
    });

    hub.on('update', function (id, obj) {
        debug('update received', id, obj);
        $timeout(function () {
            Corpus.corpus[id] = obj;
        }, 0);
    });

    return Corpus;
})
;

debug('Complete');

