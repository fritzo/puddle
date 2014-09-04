#Puddle

This is a main Puddle repository.

This repository has documentation on Puddle and overwiew of other puddle modules.
While puddle modules are being actievely developed they are checked into this repo as well.


There are following puddle- repos:

- puddle-hub  // synchronization
- puddle-corpus // storage
- [puddle-syntax](https://github.com/pomagma/puddle-syntax) // conversion from one courpus form to another
- puddle-editor // in memory editor
- puddle-cli // simple command line client to puddle-editor
- puddle-html5 // rich client to puddle-editor
- puddle-d3 // view only client to puddle-editor



#### Demo of how to use local modules:

    $ git clone git@github.com:pomagma/puddle
    $ cd puddle
    $ ls
      puddle-corpus
      puddle-hub
      puddle-editor
    $ cd puddle-editor
    $ mkdir -p node_modules
    $ cd node_modules
    $ ln -s ../../puddle-corpus  # relative link
    $ cd ..
    $ git add node_modules/puddle-corpus  # so other devs can use this
    $ git commit -m 'Add local npm link to puddle-corpus'