# Puddle API Reference

* [Server Admin](#server-admin)
* [Server REST API](#server-rest)
* [Server socket.io API](#server-socketio)

### Server Signal Handling <a name="server-admin"/>

-   Environment Variables

        PUDDLE_PORT=34936
        POMAGMA_ANALYST_ADDRESS=tcp://localhost:34936
        POMAGMA_LOG_LEVEL=0

-   On signal `SIGINT` the server dumps the corpus to `corpus.dump`

### Server Rest API <a name="server-rest"/>

-   GET `/corpus/lines` - Reads all lines in corpus.

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

-   GET `/corpus/line/<id>` - Reads a single line of the corpus

    **Example Response:**

        {
            "data": {
                "name": "util.join",
                "code": "J"
            }
        }

-   POST `/corpus/line` - Creates a new line in the corpus;
    gets back a server-assigned id

    **Example Request:**

        {
            "name": "util.join",
            "code": "J"
        }

    **Example Response:**

        {
            "id": "26"
        }

-   PUT `/corpus/line/<id>` - Updates an existing line in the corpus.

    **Example Request:**

        {
            "name": "util.join",
            "code": "APP I J"
        }

-   DELETE `/corpus/line/<id>` - Delete an existing line in the corpus.

-   GET `/corpus/validities` - Get line-by-line validities of entire corpus.

    This is a batch request because
    each line's validity depends on all the lines it references,

    **Example Request:**

        [
            {"id": "0", "is_top": false, is_bot: null, pending: false},
            {"id": "0", "is_top": false, is_bot: null, pending: false},
            {"id": "0", "is_top": false, is_bot: false, pending: false}
        ]

    **Latency:**
    The server responds quickly with a partial answer and begins computing
    a full answer.
    The server guarantees that, as the client polls,
    eventually all lines in the repsonse satisfy `line.pending = false`.

### Server socket.io API <a name="server-socketio"/>

- Receive `action` - Format has not been settled.

