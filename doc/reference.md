# Puddle API Reference

* [Server Admin](#server-admin)
* [Server REST API](#server-rest)
* [Server socket.io API](#server-socketio)
* [Client `TODO.js`](#todojs)
* [Client `assert.js`](#assertjs)
* [Client `log.js`](#logjs)
* [Client `keycode.js`](#keycodejs)
* [Client `test.js`](#testjs)
* [Client `corpus.js`](#corpusjs)
* [Client `navigate.js`](#navigatejs)
* [Client `view.js`](#viewjs)
* [Client `menu.js`](#menujs)
* [Client `editor.js`](#editorjs)
* [Client `main.js`](#mainjs)

Related documentation:

* [puddle-syntax](https://github.com/fritzo/puddle-syntax)
* [pomagma client](https://github.com/fritzo/pomagma/blob/master/doc/client.md)

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


## Client <a name="client"/>

### `TODO.js` <a name="todojs"/>

    var TODO = require('./TODO');
    TODO('throws a TodoException with this message');

### `assert.js` <a name="assertjs"/>

    var assert = require('./assert');
    assert(condition, message);
    assert.equal(actual, expected);
    assert.forward(fwd, listOfPairs);  // fwd(x) === y for each pair [x, y]
    assert.backward(bwd, listOfPairs);  // x === bwd(y) for each pair [x, y]
    assert.inverses(fwd, bwd, listOfPairs);  // fwd(x) === y && x === bwd(y)

### `log.js` <a name="logjs"/>

    var log = require('./log');
    log('just like console.log, bug works in web workers');

### `keycode.js` <a name="keycodejs"/>

Just a static dictionary of ascii key codes.

    {
        'backspace': 8,
        'tab': 9,
        'enter': 13,
        'shift': 16,
        ...
    }

### `test.js` <a name="testjs"/>

Unit testing library.

    var test = require('./test');

    test('test title', callback);       // declares synchronous test
    test.async('test title', callback); // declares async test
    test.runAll();                      // run all unit tests

    console.log(test.testing());        // prints whether tests are being run
    console.log(test.hasRun());         // prints whether tests have finished
    console.log(test.testCount());      // prints cumulative test count
    console.log(test.failCount());      // prints cumulative failed test count

Utilities for performing functions on trees.

    var root = arborist.getRoot(indexed);
    var varList = arborist.getBoundAbove(term);  // -> ['a', 'b']
    var varSet = arborist.getVars(term);         // -> {'a': null, 'b': null}
    var name = arborist.getFresh(term);          // -> 'c'

### `corpus.js` <a name="corpusjs"/>

Editor's view of the server-side corpus.
Each client stores an in-memory copy.

    var corpus = require('./corpus');
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

### `navigate.js` <a name="navigatejs"/>

    var navigate = require('./navagate');
    navigate.on(name, callback, description);   // add callback
    navigate.off();                             // clear callbacks
    navigate.trigger(event);

    // search for global variable
    navigate.search(rankedStrings, acceptMatch, cancel, renderString);

    // create new global variable name
    navigate.choose(isValidFilter, acceptName, cancel);

### `view.js` <a name="viewjs"/>

The view object is the pane on the left showing the corpus.

    var view = require('./view');
    view.init({
        getLine: ...,
        getValidity: ...,
        lines: ...
    });

    view.insertAfter(prevId, id);
    view.update(id);
    view.remove(id);

### `menu.js` <a name="menujs"/>

The menu object is the pane on the right.
It rebuilds itself at every action.
The menu is the sole form of input to puddle, by design.

    var menu = require('./menu');
    menu.init({
        actions = {...},                // callbacks bound to actions
        getCursor = function () {...}   // returns cursor
    });

### `editor.js` <a name="editorjs"/>

    var editor = require('./editor');
    editor.main();                      // start puddle editor

### `main.js` <a name="mainjs"/>

Main entry point, either starts unit tests or starts editor,
depending on whether `location.hash === '#test'`.
