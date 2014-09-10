'use strict';

var _ = require('underscore');
var assert = require('assert');
var syntax = require('./puddle-syntax-0.1.2');

var template = function (string) {
    return function (args) {
        return string.replace(/{(\d+)}/g, function (match, pos) {
            return args[pos];
        });
    };
};

// see http://www.fileformat.info/info/unicode/category/Sm/list.htm
var templates = {
    HOLE: template('<span class=hole>?</span>'),
    TOP: template('<span class=atom>&#x22a4;</span>'),
    BOT: template('<span class=atom>&#x22a5;</span>'),
    //I: template('<span class=atom>&#x1D540;</span>'),
    I: template('<span class=atom>1</span>'),
    APP: template('{0} {1}'),
    COMP: template('{0}<span class=operator>&#8728;</span>{1}'),
    JOIN: template('{0}<span class=operator>|</span>{1}'),
    RAND: template('({0}<span class=operator>+</span>{1})'),
    LAMBDA: template('&lambda;{0} {1}'),
    //LAMBDA: template('{0} &#x21a6; {1}'),
    //LAMBDA: template('{1} / {0}'),
    LETREC: template('let {0} = {1}. {2}'),
    QUOTE: template('{{0}}'),
    LESS: template('{{0} &#8849; {1}}'),
    NLESS: template('{{0} &#8930; {1}}'),
    EQUAL: template('{{0} = {1}}'),
    DEFINE: template('<span class=keyword>Define</span> {0} = {1}.'),
    ASSERT: template('<span class=keyword>Assert</span> {0}.'),
    CURSOR: template('<span class=cursor>{0}</span>'),
    PAREN: template('({0})'),
    VAR: function (name) {
        name = name.replace(/\./g, '<b>.</b>');
        return template('<span class=variable>{0}</span>')([name]);
    }
};

var render = syntax.compiler.fold(function (token, args) {
    assert(_.has(templates, token), 'unknown token: ' + token);
    return templates[token](args);
});

module.exports = render;
