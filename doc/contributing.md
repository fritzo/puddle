# Contributing to Puddle

See the [Introduction](/doc/intro.md) for vocabulary.

See [asana](https://app.asana.com/0/15654386884203) for task planning.

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
