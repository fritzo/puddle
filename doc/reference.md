# Puddle API Reference

* [Server Admin](#server-admin)
* [Server REST API](#server-rest)
* [Server socket.io API](#server-socketio)
* [Client `TODO.js`](#todojs)
* [Client `assert.js`](#assertjs)
* [Client `trace.js`](#tracejs)
* [Client `corpus.js`](#corpusjs)
* [Client `forest.js`](#forestjs)
* [Client `cursor.js`](#cursorjs)
* [Client `view.js`](#viewjs)
* [Client `menu-builder.js`](#menubuilder)
* [Client `menu-renderer.js`](#menurenderer)

Related documentation:

* [puddle-syntax](https://github.com/pomagma/puddle-syntax)
* [pomagma client](https://github.com/pomagma/blob/master/doc/client.md)

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

### `trace.js` <a name="tracejs"/>

Convenience method for debugging.
Allows to quikly show trace and arguments passed into function.

    var debug = require('debug')('puddle:editor');
    var trace = require('./trace')(debug);
    
    //Will output to console 'puddle:editor Hello'
    //arguments converted to array.
    //if third parameter is true will do console.trace() as well. 
    //Second and third arguments are optional
    trace('Hello', arguments, true)
    

### `corpus.js` <a name="corpusjs"/>
	
    Uses puddle-socket to fetch data from server
    Stores corpus as `lines` internally
    Provides knowledge of defenitions/occurrences
    Fetches validities, emits 'updateValidity' event.
    Exposes CRUD API and emits CRUD events for corpus lines.
    Handles checkin/checkout of lines (w/o real blocking on server yet)
    Does not care about any other modules.
	

### `forest.js` <a name="forestjs"/>

    Stores corpus as trees internally
    Keeps trees sorted
    Listens for CRUD events from Corpus and reemits them as trees


### `cursor.js` <a name="cursorjs"/>
	
    Stores/shares pointer to node in a Forest.
    Does not affect nodes in any way.
    Exposes various methods to move itself between nodes of Forest
    Notifies corpus of check-ins, check-outs
    Exposes .replaceBelow to alter trees.
    Listens to Forest changes to avoid being in orphan nodes.
    Emits `move` event.


### `view.js` <a name="viewjs"/>

    The view object is the pane on the left showing the corpus.
    Renders corpus using trees from Forest
    Listens for forest CRUD events.
    Listens for cursor moves.
    Listens for validities update.	
    Uses DOM as internal state.
    Does not have API   


### `menu-builder.js` <a name="menubuilder"/>
 
    Aware of cursor position in a forest
    Knows mapping of keys <=> UI actions
    Builds UI action functions using Forest and Cursor API and module.exports them	 
    Logs every user action to server via socket.io
    Does not have internal state.


### `menu-renderer.js` <a name="menurenderer"/> 

    Takes array of actions/keys from menu-builder and renders it into HTML with onKeyPress events.
    Listens for Cursor 'move' event to rerender menu.
    Does not have internal state or API