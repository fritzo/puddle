'use strict';

var stdin = process.openStdin();
var input = '';
stdin.on('data', function (chunk) {
    input += chunk;
});

stdin.on('end', function () {
    try {
        var json = JSON.parse(input);
        var corpus = [];
        Object.keys(json).forEach(function (key) {
            corpus.push(json[key].code);
        });
        corpus.sort();
        corpus.unshift(
            '# this file is created by convert.jsof puddle-corpus module');
        process.stdout.write(corpus.join('\n'));
    } catch (e) {
        var id = 0;
        var json = [];
        input.toString().split('\n').forEach(function (line) {
            line = line.replace(/#.*/, '').trim();
            if (line) {
                json.push({id: id, code: line});
                id++;
            }
        });
        process.stdout.write(JSON.stringify(json, undefined, 4));
    }


});


