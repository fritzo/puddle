module.exports = (function () {
    'use strict';

    var compiler = require('./language/compiler');

    var template = compiler.renderer.template;

    var templates = {
        HOLE: '<span class=hole>?</span>',
        TOP: '<span class=atom>&#x22a4;</span>',
        BOT: '<span class=atom>&#x22a5;</span>',
        //I: '<span class=atom>&#x1D540;</span>',
        I: '<span class=atom>1</span>',
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
        atom: template('({0})'),
        error: template(
                '<span class=error>compiler.render error: {0}</span>'),
        VAR: function (name) {
            name = name.replace(/\./g, '<b>.</b>');
            return template('<span class=variable>{0}</span>')(name);
        }
    };

    return compiler.renderer(templates);
})();
