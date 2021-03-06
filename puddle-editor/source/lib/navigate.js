/* jshint unused: false */
'use strict';

var _ = require('lodash');
var $ = require('jquery');
var io = require('socket.io-client');
var assert = require('./assert');
var keycode = require('./keycode');
var debug = require('debug')('puddle:editor:navigate');
var trace = require('./trace')(debug);

var socket = io();

//--------------------------------------------------------------------------
// Events

/** @constructor */
var KeyEvent = function (which, modifiers) {
    if (modifiers === undefined) {
        modifiers = {};
    }
    this.state = [
        which,
            modifiers.shift || false,
            modifiers.ctrl || false,
            modifiers.alt || false,
            modifiers.meta || false
    ];
};

KeyEvent.prototype = {
    match: function (event, match) {
        var state = this.state;
        return (
            state[0] === event.which &&
            state[1] === event.shiftKey &&
            state[2] === event.ctrlKey &&
            state[3] === event.altKey &&
            state[4] === event.metaKey
            );
    }
};

var cases = (function () {
    var cases = {};
    for (var name in keycode) {
        var which = keycode[name];
        cases[name] = new KeyEvent(which);
        cases['shift+' + name] = new KeyEvent(which, {'shift': true});
        cases['ctrl+' + name] = new KeyEvent(which, {'ctrl': true});
    }

    _.forEach('ABCDEFGHIJKLMNOPQRSTUVWXYZ', function (name) {
        cases[name] = cases['shift+' + name.toLowerCase()];
    });

    var aliases = {
        ' ': 'space',
        '{': 'shift+openbracket',
        '\\': 'backslash',
        '/': 'slash',
        '|': 'shift+backslash',
        '=': 'equal',
        '+': 'shift+equal',
        '<': 'shift+comma',
        '>': 'shift+period',
        '_': 'shift+dash',
        '.': 'period',
        '(': 'shift+9',
        ')': 'shift+0',
        '?': 'shift+slash'
    };
    _.each(aliases, function (alias, actual) {
        cases[actual] = cases[alias];
    });

    return cases;
})();

var icons = {};
_.each(cases, function (unused, name) {
    var escaped = name.replace(/\b\+\b/g, '</span>+<span>');
    icons[name] = $('<th>').html('<span>' + escaped + '</span>');
});

//--------------------------------------------------------------------------
// Event Handling

var events = [];
var callbacks = [];

var on = function (name, callback, description) {
    trace('on');
    assert(_.has(cases, name));
    events.push(cases[name]);
    var loggedCallback = function () {
        socket.emit('action', name);
        callback();
    };
    callbacks.push(loggedCallback);
    if (description !== undefined) {
        $('#navigate table').append(
            $('<tr>')
                .on('click', loggedCallback)
                .append(icons[name], $('<td>')
                    .html(description)));
    }
};

var off = function () {
    trace('off');
    events = [];
    callbacks = [];
    $('#navigate').empty().append($('<table>'));
};


//--------------------------------------------------------------------------
// Selection via search

var search = (function () {
    trace('Search init');
    var strings = [];
    var $input;
    var matches = [];
    var $matches;
    var render = _.identity;

    var update = function () {
        var re = new RegExp($input.val());
        matches = [];
        $matches.empty();
        strings.forEach(function (string) {
            if (re.test(string)) {
                matches.push(string);
                $matches.append($('<pre>').html(render(string)));
            }
        });
        $matches.children().first().addClass('selected');
        debug('DEBUG ' + matches);
    };

    var cancelCallback;
    var acceptCallback;
    var accept = function () {
        if (matches.length) {
            debug('DEBUG accepting ' + matches[0]);
            acceptCallback(matches[0]);
        } else {
            cancelCallback();
        }
    };

    return function (rankedStrings, acceptMatch, cancel, renderString) {
        trace('Search');
        strings = rankedStrings;
        render = renderString;
        acceptCallback = acceptMatch;
        cancelCallback = cancel;

        off();
        on('enter', accept, 'accept');
        on('tab', cancel, 'cancel');
        $input = $('<input>');
        $matches = $('<div>');
        $('#navigate').append($input, $matches);
        $input.focus().on('keydown', _.debounce(update));
        update();
    };
})();

var choose = (function () {
    trace('choose init');
    var $input;
    var input;
    var isValid;
    var valid;

    var update = function () {
        input = $input.val();
        valid = isValid(input);
        $input.attr({'class': valid ? 'valid' : 'invalid'});
    };

    var cancelCallback;
    var acceptCallback;
    var accept = function () {
        if (valid) {
            debug('DEBUG choosing ' + input);
            acceptCallback(input);
        } else {
            cancelCallback();
        }
    };

    return function (isValidFilter, acceptName, cancel) {
        trace('choose');
        isValid = isValidFilter;
        acceptCallback = acceptName;
        cancelCallback = cancel;

        off();
        on('enter', accept, 'accept');
        on('tab', cancel, 'cancel');
        $input = $('<input>');
        $('#navigate').append($input);
        $input.focus().on('keydown', _.debounce(update));
        update();
    };
})();

//--------------------------------------------------------------------------
// Interface

module.exports = {
    on: on,
    off: off,
    search: search,
    choose: choose,
    hookEvents: function () {
        trace('hookEvents to window');
        $(window).off('keydown').on('keydown', function (event) {
            for (var i = 0; i < events.length; ++i) {
                if (events[i].match(event)) {
                    event.preventDefault();
                    trace('matched', event.which);
                    callbacks[i]();
                    return;
                }
            }
            trace('unmatched ', event.which);
        });
    }
};
