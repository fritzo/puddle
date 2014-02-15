if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function(require){
  'use strict';

  var assert = require('assert');
  var path = require('path');
  var fs = require('fs');
  var _ = require('underscore');
  var zmq = require('zmq');
  var protobufjs = require('protobufjs');
  var test = require('./test');

  var validateCorpus = function (lines) {
    return _.map(lines, function () {
      return {
        'is_bot': null,
        'is_top': null,
        'pending': false
      };
    });
  };

  return {
    validateCorpus: validateCorpus
  };
});
