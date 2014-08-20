'use strict';

var TEST_COUNT = 28;  // this must be updated every time tests are added
var PORT = 34935;
var ADDRESS = 'http://localhost:' + PORT + '/#test';

var page = require('webpage').create();
page.settings.resourceTimeout = 5000;
page.onConsoleMessage = function (data) {
    console.log('page: ' + data);
};
var assert = function (condition, message) {
    if (!condition) {
        throw message;
    }
};

console.log('loading page ' + ADDRESS);
page.open(ADDRESS, function (status) {
    assert(status === 'success', 'failed to load page: ' + status);

    page.evaluate(function () {
        require(['test'], function (test) { window.test = test; });
    });

    var waitCount = 10;
    var validate = function () {
        console.log('checking...');
        var testState = page.evaluate(function () {
            return window.test && {
                hasRun: test.hasRun(),
                failCount: test.failCount(),
                testCount: test.testCount()
            } || {};
        });

        if (testState.hasRun) {
            var failCount = testState.failCount;
            var testCount = testState.testCount;
            assert(failCount == 0, failCount + ' tests failed');
            assert(testCount == TEST_COUNT,
                'ERROR expected ' + TEST_COUNT + ' tests, actual ' + testCount);
            console.log('Passed');
            phantom.exit();
        } else if (--waitCount) {
            console.log('waiting...');
            // broken https://github.com/ariya/phantomjs/issues/10832 
            //setTimeout(validate, 1000);
            setTimeout(function () { setTimeout(validate, 1000); }, 0);
        } else {
            throw 'Browser timed out';
        }
    };
    validate();
});
