'use strict';

var stdin = process.openStdin();
var input = '';
stdin.on('data', function (chunk) {
    input += chunk;
});


function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

var converter = function (input) {
    var array;
    try {
        //if we can parse JSON than it is JSON->Corpus
        array = JSON.parse(input);
        var corpus = [];
        array.forEach(function (obj) {
            corpus.push(obj.code);
        });
        corpus = corpus.filter(onlyUnique).sort();
        corpus.unshift(
            '# this file is created by convert.js of puddle-corpus module');
        return corpus.join('\n');
    } catch (e) {
        //if not than it is Corpus->JSON
        var id = 0;
        array = [];
        var unique = input.toString().split('\n').filter(onlyUnique);
        unique.sort().forEach(function (line) {
            line = line.replace(/#.*/, '').trim();
            if (line) {
                array.push({id: id, code: line});
                id++;
            }
        });

        return JSON.stringify(array, undefined, 4);
    }
};


stdin.on('end', function () {
    process.stdout.write(converter(input));
});


module.exports = converter;
