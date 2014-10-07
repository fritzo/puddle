'use strict';

var _ = require('lodash');
var $ = require('jquery');
var syntax = require('puddle-syntax');
var renderTerm = require('./render-term.js');
var renderValidity = require('./render-validity.js');


module.exports = function (editor) {
    var render = function () {
        var div = $('#code').empty()[0];
        editor.getIds().forEach(function (id, index, array) {
            var line = editor.getLine(id);
            var validity = editor.getValidity(id);
            var $line = $('<pre>').attr('id', 'line' + id).appendTo(div);
            line = syntax.compiler.parenthesize(line);
            $line.html(renderValidity(validity) + renderTerm(line));

            $line.on('click', function () {
                var newPos = _.indexOf(array, id);
                var oldPos = _.indexOf(array, editor.getCursorId());
                var delta = newPos - oldPos;
                editor.getActions().moveCursorLine(delta);
            });

        });
        var pos = $('span.cursor').offset().top - $(window).height() / 2;
        $(document.body).animate({scrollTop: pos}, 50);
    };

    render();
    editor.on('update', render);
    editor.on('updateValidity', render);
};