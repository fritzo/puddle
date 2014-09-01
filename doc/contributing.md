# Contributing to Puddle

- Vocabulary is defined in the [Introduction](/doc/intro.md)
- Task planning in [asana](https://app.asana.com/0/15654386884203)
- [Values](#values)
- [Module Architecture](#module-architecture)
- [Client-Server Architecture](#client-server-architecture)

## Values <a name="values"/>

1. Maintainability
2. Data Integrity and Correctness
3. API Before UI
4. Responsive Minimal UI
5. Extensibility

## Module Architecture <a name="module-architecture"/>

### [puddle-syntax](https://github.com/fritzo/puddle-syntax)

- depends only on lodash; dev-depends on mocha+chai
- language-specific tools
- heavily unit tested

### [puddle-editor](https://github.com/fritzo/puddle-editor) (planned)

- depends only on lodash; dev-depends on mocha+chai
- corpus file format
- corpus variable constraints
- communication with a validator conforming to the pomagma interface
- movement of cursor around corpus and within a term
- generation of possible actions from cursor position (currently navigator.js)
- in-memory editing of corpus 
- heavily unit-tested

### [puddle](https://github.com/fritzo/puddle)

- depends on 20+ libraries
- injects dependencies on pomagma and puddle-syntax into puddle-editor
- persists to mongodb
- browserify and expose puddle-editor in a browser
- ui
- tests: unit + integration + acceptance

## Client-Server Architecture <a name="client-server-architecture"/>

Planned client-server architecture:

[![Architecture](/doc/architecture.png)](/doc/architecture.pdf)

## Roadmap (unprioritized) <a name="roadmap"/>

- Prototype
    - [x] Client talks to server
    - [x] Client supports text-based rendering
    - [x] Client supports keyboard-based editing
    - [x] Server persists corpus to a file
    - [x] Server talks to a Pomagma engine
- User Action Logging
    - [x] Client logs user action to server
    - [x] Server aggregates and stores user action logs
    - [ ] Server broadcasts user position to other users
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
