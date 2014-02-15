if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function(require){
  'use strict';

  var tests = [];

  var test = function (title, callback) {
    tests.push({
      'title': title,
      'callback': callback
    });
  };

  test.runAll = function () {
    var describe = require('mocha').describe;
    var it = require('mocha').it;
    describe('Global:', function(){
      tests.forEach(function(args){
        it(args.title, args.callback);
      });
    });
  };

  return test;
});
