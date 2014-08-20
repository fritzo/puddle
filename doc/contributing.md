# Contributing to Pomagma

## Planned Tasks

1.  Improve code quality
    - Use linter (jslint/closure/...?)
    - Use build + minification system (gulp/grunt/...?)
    - Use automated documentation system (jsdoc?)
    - Refactor into smaller modules
    - Separate testing code from production code

2.  Refactor to support new features
    - Factor `neighborhood` object out of `navagate.js`
    - Support operations on `neighborhoods`
    - Support custom corpus.dump for testing
    - Factor rendering code out of compiler

4.  Implement new features
    -   (Fritz) Support action filtering.
        Actions that would result in invalid corpus states are removed from
        the neighborhood.
    -   (?) Add automated browser tests by generating random action sequences
    -   (Yan) Support switching between views:
        - text corpus (as currently exists)
        - text navigator (as currently exists)
        - d3 corpus
    -   (Yan) Support mouse/touch - based input
    -   (Yan) Support multiple clients per user (single user)
    -   (Yan) Support multiple users via github authentication
    -   (Fritz) Support zero/multiple pomagma servers

## Roadmap

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
    - [ ] Server synchronizes corpus across multiple clients
- Multi-User Support
    - [ ] Server authenticates and distinguishes among clients
    - [ ] User actions are synchronized among multiple devices/views
- User Interface
    - [ ] Client supports touch-based editing
    - [ ] Client supports svg-based rendering
    - [ ] Server talks to multiple Pomagma engines (to reduce latency)

## Client Server Architecture

Planned client-server architecture:

[![Architecture](/doc/architecture.png)](/doc/architecture.pdf)