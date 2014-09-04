'use strict';

var stdin = process.openStdin();
var input = '';
stdin.on('data', function (chunk) {
    input += chunk;
});

var converter = function (input) {
    try {
        //if we can parse JSON than it is JSON->Corpus
        var json = JSON.parse(input);
        var corpus = [];
        Object.keys(json).forEach(function (key) {
            corpus.push(json[key].code);
        });
        corpus.sort();
        corpus.unshift(
            '# this file is created by convert.js of puddle-corpus module');
        return corpus.join('\n');
    } catch (e) {
        //if not than it is Corpus->JSON
        var id = 0;
        var json = [];
        input.toString().split('\n').forEach(function (line) {
            line = line.replace(/#.*/, '').trim();
            if (line) {
                json.push({id: id, code: line});
                id++;
            }
        });
        return JSON.stringify(json, undefined, 4);
    }
};


stdin.on('end', function () {
    process.stdout.write(converter(input));
});


module.exports = converter;
