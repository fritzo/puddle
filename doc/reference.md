# Puddle API Reference

* [Server Admin](#server-admin)
* [Server REST API](#server-rest)
* [Server socket.io API](#server-socketio)

## Server

### Server Admin <a name="server-admin"/>

-   Environment Variables

        PUDDLE_PORT=34936
        POMAGMA_ANALYST_ADDRESS=tcp://localhost:34936
        POMAGMA_LOG_LEVEL=0

-   On signal `SIGINT` the server dumps the corpus to `corpus.dump`

### Server Rest API <a name="server-rest"/>

-   GET `/corpus/lines` - Read all lines in corpus.

    **Example Response:**

        {
            "data": [
                {
                    "id": "26",
                    "name": "util.join",
                    "code": "J"
                },
                {
                    "id":"4",
                    "name": null,
                    "code": "EQUAL APP VAR types.semi BOT BOT"
                }
            ]
        }

-   GET `/corpus/line/<id>` - Read a single line of the corpus.

    **Example Response:**

        {
            "data": {
                "name": "util.join",
                "code": "J"
            }
        }

-   POST `/corpus/line` - Create a new line in the corpus;
    get back a server-assigned id.

    **Example Request:**

        {
            "name": "util.join",
            "code": "J"
        }

    **Example Response:**

        {
            "id": "26"
        }

-   PUT `/corpus/line/<id>` - Update an existing line in the corpus.

    **Example Request:**

        {
            "name": "util.join",
            "code": "APP I J"
        }

-   DELETE `/corpus/line/<id>` - Delete an existing line in the corpus.

-   GET `/corpus/validities` - Get line-by-line validities of entire corpus.

    This is a batch request because
    each line's validity depends on all the lines it references,

    **Example Response:**

        {
            "data": [
                {"id": "0", "is_top": false, is_bot: null, pending: false},
                {"id": "1", "is_top": false, is_bot: null, pending: false},
                {"id": "2", "is_top": false, is_bot: false, pending: false},
                {"id": "3", "is_top": null, is_bot: null, pending: true}
            ]
        }

    **Latency:**
    The server responds quickly with a partial answer and begins computing
    a full answer.
    The server guarantees that, as the client polls,
    eventually all lines in the repsonse satisfy `line.pending = false`.

### Server socket.io API <a name="server-socketio"/>

- Receive `action` - Format has not been settled.


## Client

### `TODO.js`

    var TODO = require('TODO');
    TODO('throws a TodoException with this message');

### `assert.js`

    var assert = require('assert');
    assert(condition, message);
    assert.equal(actual, expected);
    assert.forward(fwd, listOfPairs);  // fwd(x) === y for each pair [x, y]
    assert.backward(bwd, listOfPairs); // x === bwd(y) for each pair [x, y]
    assert.inverses(fwd, bwd, listOfPairs); // fwd(x) === y && x === bwd(y)

### `log.js`

    var log = require('log');
    log('just like console.log, bug works in web workers');

### `keycode.js`

    {
        'backspace': 8,
        'tab': 9,
        'enter': 13,
        'shift': 16,
        ...
    }

### `test.js`

Unit testing library.

    var test = require('test');

    test('test title', callback);       // declares synchronous test
    test.async('test title', callback); // declares async test
    test.runAll();                      // run all unit tests

    console.log(test.testing());        // prints whether tests are being run
    console.log(test.hasRun());         // prints whether tests have finished
    console.log(test.testCount());      // prints cumulative test count
    console.log(test.failCount());      // prints cumulative failed test count

### `language/pattern.js`

ML-style pattern matching with variable binding.
This is used internally by compiler and ast.

    var pattern = require('language/pattern');
    var x = pattern.variable('x');
    var y = pattern.variable('y');
    pattern.match(
        patt1, callback1,
        patt2, callback2,
        patt3, callback3
    );

### `language/compiler.js`

    var compiler = require('compiler');
    compiler.symbols;

    // conversions
    var lambda = compiler.load(string);
    var string = compiler.dump(lambda);
    var lambda = compiler.loadLine(line);
    var line = compiler.dumpLine(lambda);

    var string = compiler.print(lambda);
    var html = compiler.render(lambda);

    compiler.enumerateFresh(0);  // -> 'a'
    compiler.enumerateFresh(1);  // -> 'b'
    compiler.enumerateFresh(2);  // -> 'c'

    compiler.substitute(name, def, body);  // replace name with def in body

### `language/ast.js`

Abstract Syntax Trees.

    var ast = require('language/ast');

    // convert indexed <--> flat terms
    var indexed = ast.load(flat);
    var flat = ast.dump(indexed);

    var cursor;
    cursor = ast.cursor.create();
    ast.cursor.remove(cursor);
    ast.cursor.insertBelow(cursor, above, pos);
    ast.cursor.insertAbove(cursor, below);
    cursor = ast.cursor.replaceBelow(oldCursor, newTerm);

    var direction = 'U';  // or 'D', 'L', 'R'
    var success = ast.cursor.tryMove(cursor, direction);

    var root = ast.getRoot(indexed);
    var varList = ast.getBoundAbove(term);  // -> ['a', 'b']
    var varSet = ast.getVars(term);         // -> {'a': null, 'b': null}
    var name = ast.getFresh(term);          // -> 'c'

### `corpus.js`

Editor's view of the server-side corpus.
Each client stores an in-memory copy.

    var corpus = require('corpus');
    corpus.ready(cb);       // calls cb after client loads corpus from server
    corpus.validate();      // validates corpus, throws AssertError if invalid
    var line = corpus.findLine(id);
    var lines = corpus.findAllLines();
    var names = corpus.findAllNames();
    var id = corpus.findDefinition(name);
    if (corpus.canDefine(name)) {
        // we can create a new definition of name
    }
    var ids = corpus.findOccurrences(name);
    if (corpus.hasOccurrences(name)) {
        // we cannot delete the definition of name
    }
    corpus.insert(line, done, fail);
    corpus.update(newLine);
    corpus.remove(id);

### `navigate.js`

    var navigate = require('navagate');
    navigate.on(name, callback, description);   // add callback
    navigate.off();                             // clear callbacks
    navigate.trigger(event);

    // search for global variable
    navigate.search(rankedStrings, acceptMatch, cancel, renderString);

    // create new global variable name
    navigate.choose(isValidFilter, acceptName, cancel);

### `symbols.js`

    var symbols = require('symbols');
    assert(symbols.isToken('a'));
    assert(symbols.isKeyword('JOIN'));
    assert(symbols.isLocal('a'));
    assert(symbols.isGlobal('util.pair'));

### `editor.js`

    var editor = require('editor');
    editor.main();                      // start puddle editor

### `main.js`

Main entry point, either starts unit tests or starts editor,
depending on whether `location.hash === '#test'`.
