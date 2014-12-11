'use strict';

var debug = require('debug')('puddle:editor:menuRenderer');
var _ = require('lodash');
var $ = require('jquery');
var keypress = require('../lib/keypress').keypress;
var keyListener = new keypress.Listener();
var trace = require('./trace')(debug);
var renderTerm = require('./render-term.js');
var cursor = require('./cursor');
var corpus = require('./corpus');

var VAR = require('puddle-syntax').compiler.fragments.church.VAR;
var menuBuilder = require('./menu-builder');


//--------------------------------------------------------------------------
// Event Handling

var search = function (acceptMatch) {
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


    var accept = function () {
        if (matches.length) {
            debug('DEBUG accepting ' + matches[0]);
            acceptMatch(matches[0]);
        }
    };

    return function () {
        trace('Search');
        strings = _.keys(corpus.getDefinitions());
        render = function (name) {
            return renderTerm(VAR(name));
        };


        off();
        on('enter', accept, 'accept');
        on('tab', render, 'cancel');
        $input = $('<input>');
        $matches = $('<div>');
        $('#navigate').append($input, $matches);
        $input.focus().on('keydown', _.debounce(update));
        update();
    };
};

//wrapper to show choose dialog for DEFINE function
var choose = function (acceptName) {
    var $input;
    var input;
    var valid;

    var update = function () {
        input = $input.val();
        valid = corpus.canDefine(input);
        $input.attr({'class': valid ? 'valid' : 'invalid'});
    };

    return function () {
        trace('choose');
        off();

        on('enter', function () {
            if (valid) {
                debug('DEBUG choosing ' + input);
                acceptName(input);
            }
        }, 'accept');

        on('tab', render, 'cancel');

        $input = $('<input>');
        $('#navigate').append($input);
        $input.focus().on('keydown', _.debounce(update));
        update();
    };
};
var upperCaseAliases = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ?><\":{}|~+_!@#$%^&*()';
var on = function (name, callback, description) {
    var listenKey;
    if (_.contains(upperCaseAliases, name)) {
        listenKey = 'shift ' + name.toLowerCase();
    } else {
        listenKey = name.replace(/\+/g, ' ');
    }

    /* jshint camelcase:false */
    keyListener.register_combo({
        'keys': listenKey,
        'on_keydown': function () {
            callback();
        },
        is_solitary: true
    });
    /* jshint camelcase:true */


    //TODO this is a hack to add UI wrapper for some functions
    //which require special input parameters or extra UI
    if (name === 'D') {
        callback = choose(callback);
    }
    if (name === '/') {
        callback = search(callback);
    }


    if (description !== undefined) {
        if (_.isArray(description)) {
            description = renderTerm(description);
        }
        var escaped = name.replace(/\b\+\b/g, '</span>+<span>');
        var icon = $('<th>').html('<span>' + escaped + '</span>');
        $('#navigate table').append(
            $('<tr>')
                .on('click', callback)
                .append(icon, $('<td>')
                    .html(description)));
    }
};

var off = function () {
    trace('off');
    keyListener.reset();
    $('#navigate').empty().append($('<table>'));
};

var render = function () {
    trace('MenuRender');
    off();
    menuBuilder().forEach(function (action) {
        on(action[0], action[1], action[2]);
    });
};

cursor.on('move', function () {
    trace('Cursor move');
    render();
});

