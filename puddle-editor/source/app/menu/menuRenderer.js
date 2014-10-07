'use strict';

var debug = require('debug')('puddle:editor:menuRenderer');
var _ = require('lodash');
var $ = require('jquery');
var keypress = require('../../lib/keypress').keypress;
var keyListener = new keypress.Listener();
var trace = require('../trace')(debug);

var renderTerm = require('../render-term.js');
var VAR = require('puddle-syntax').compiler.fragments.church.VAR;


module.exports = function (menu, editor) {
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
            var rankedStrings = editor.getCorpus().findAllNames();
            trace('Search');
            strings = rankedStrings;
            render = function (name) {
                return renderTerm(VAR(name));
            };


            off();
            on('enter', accept, 'accept');
            on('tab', reRender, 'cancel');
            $input = $('<input>');
            $matches = $('<div>');
            $('#navigate').append($input, $matches);
            $input.focus().on('keydown', _.debounce(update));
            update();
        };
    };

    var choose = function (acceptName) {
        trace('choose init');
        var $input;
        var input;
        var valid;

        var update = function () {
            input = $input.val();
            valid = editor.getCorpus().canDefine(input);
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

            on('tab', reRender, 'cancel');

            $input = $('<input>');
            $('#navigate').append($input);
            $input.focus().on('keydown', _.debounce(update));
            update();
        };
    };
    var upperCaseAliases = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ?><\":{}|~+_!@#$%^&*()';
    var on = function (name, callback, description) {
        trace('on');
        var listenKey;
        if (_.contains(upperCaseAliases, name)) {
            listenKey = 'shift ' + name.toLowerCase();
        } else {
            listenKey = name.replace(/\+/g, ' ');
        }

        //Ignore because of non_camel_case code.
        /* jshint ignore:start */
        keyListener.register_combo({
            'keys': listenKey,
            'on_keydown': function () {
                callback();
            },
            is_solitary: true
        });
        /* jshint ignore:end */


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

    var render = function (actions) {
        debug('Menu render', _.toArray(actions).length);
        off();
        actions.forEach(function (action) {
            on(action[0], action[1], action[2]);
        });
    };

    var reRender = function () {
        render(menu.getActions());
    };
    reRender();
    menu.on('update', render);
};