# Contributing to Pomagma

See the [Introduction](/doc/intro.md) for vocabulary.

## Planned Tasks

- Improve code quality
    - [x] (Fritz) Clean up to pass jshint linting
    - [ ] (?) Add test coverage report (coveralls + istanbul?)
    - [ ] (Yan) Use build + minification system (gulp/grunt/...?)
    - [ ] (Yan) Use automated documentation system (jsdoc?)
        Current `reference.md` is very fragile.
        - [ ] (Fritz) refactor `reference.md` to be automatically generated.
    - [ ] (Fritz) Refactor into smaller modules
    - [ ] (Fritz) Separate testing code from production code

- Refactor to support new features
    - [ ] (Fritz) Factor `neighborhood` object out of `navagate.js`
    - [ ] (Fritz) Support operations on `neighborhoods`
    - [ ] (Yan) Support custom/temporary corpus.dump for testing
    - [ ] (?) Add tests for corpus CRUD operations
        - (Yan) Suggest a test pattern / fixture
    - [ ] (Fritz) Factor rendering code out of compiler
    - [ ] (Fritz) Settle on user action data format

- Implement new features (ordered by priority)
    - [ ] (Fritz) Support action filtering.
        Actions that would result in invalid corpus states are removed from
        the neighborhood.
    - [ ] (?) Add automated browser acceptance tests
        by generating random action sequences
    - [ ] (Yan) Log user actions to database.
    - [ ] (Yan) Get gulp to push code updates to browser if possible.
        Currently `nodemon main.js` still requires a manual page refresh.
        Development would be easier if browser auto-reloaded.
    - [ ] (Yan) Support switching between views:
        - text corpus (as currently exists)
        - text navigator (as currently exists)
        - d3 corpus
    - [ ] (Yan) Support mouse/touch - based input.
        The navigator is currently clickable, but this is a hack.
        -   Support mouse-based subterm selection.
            This probably requires better dom representation of ast objects.
    - [ ] (Yan) Implement d3/graphical view of corpus
    - [ ] (Yan) Support multiple clients per user (single user)
    - [ ] (Yan) Support multiple users via github authentication
    - [ ] (Fritz) Support zero/multiple pomagma servers

## Roadmap (unprioritized)

- Prototype
    - [x] Client talks to server
    - [x] Client supports text-based rendering
    - [x] Client supports keyboard-based editing
    - [x] Server persists corpus to a file
    - [x] Server talks to a Pomagma engine
- User Action Logging
    - [x] Client logs user action to server
    - [ ] Server aggregates and stores user action logs
    - [ ] Server broadcasts user position to other users
    - [ ] Server persists corpus to database, not a file (still dumped to git)
    - [ ] Server can replay actions to a test client
    - [ ] Client can generate random action stream for testing
- Single-User Multi-Device support
    - [ ] Cursor is persisted in corpus
    - [ ] Server synchronizes corpus across multiple clients
- Multi-User Support
    - [ ] Cursor stores user id attribute
    - [ ] Server authenticates and distinguishes among clients
    - [ ] User actions are synchronized among multiple devices/views
- User Interface
    - [ ] Client supports touch-based editing
    - [ ] Client supports svg-based rendering
    - [ ] Server talks to multiple Pomagma engines (to reduce latency)

## Client Server Architecture

Planned client-server architecture:

[![Architecture](/doc/architecture.png)](/doc/architecture.pdf)
