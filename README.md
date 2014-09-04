[![Build Status](https://travis-ci.org/pomagma/puddle.svg?branch=master)](http://travis-ci.org/pomagma/puddle)

#Puddle

This is a main Puddle repository.

This repository has documentation on Puddle and overwiew of other puddle modules.
While puddle modules are being actievely developed they are checked into this repo as well.


There are following puddle- repos:

- puddle-hub <sup>1</sup>  // synchronization
- puddle-corpus <sup>1</sup> // storage
- [puddle-syntax](https://github.com/pomagma/puddle-syntax) // conversion from one courpus form to another
- puddle-editor <sup>1</sup>// in memory editor
- puddle-cli <sup>1</sup>// simple command line client to puddle-editor
- puddle-html5 <sup>1</sup>// rich client to puddle-editor
- puddle-d3 <sup>1</sup>// view only client to puddle-editor

1: Implements Corpus CRUD API

Please reffer to the [./doc](./doc) for features, architecture, contributing, etc.


##Corpus CRUD API
Below is example on Corpus CRUD API and API description:
    
    https://awwapp.com/draw.html#3ed3a3cc
    
    
    //Corpus CRUD API
        {
            incoming: {
                createLine:function (id, code) {},
                updateLine:function (id, code) {},
                removeLine: function (id) {},
                lock: function (id) {},
                unlock: function (id) {},
                connect: function (source) {
                    _.each(source.corpus, function(id, object) {
                        this.clear();
                        this.createLine(id, object);
                    }
                }
            },
            outgoing: {
                onCreate: function (callback) {},
                onCreate: function (callback) {},
                onCreate: function (callback) {}
            }
        }
        - Outgoing crud:
            - .onBind(peerId)
            - .onUpdate(function(id,code))
            - .onRemove(function(id))
            - .onCreate(function(id))
            - .onLock(function(id))
            - .onUnock(function(id))
            - //.showOtherUserIsEditingLine(id, userName)
            - // TODO validation messages
            - // TODO cursor / checkout state
    function bind (otherCorpus) {
            this.onUpdate(_.bind(otherCorpus.updateLine, otherCorpus));
            this.onRemove(_.bind(otherCorpus.removeLine, otherCorpus));
            this.onCreate(_.bind(otherCorpus.createLine, otherCorpus));
    };
    
    //Corpus
    //Push everything on init
    //Listen from there on forever and dump to disk on each change
    
    //Editor
    //Waits to be initialized with data
    //Can emit lock. Unlock. and CRUD as long as listens to lock Unlock and CRUD.
    
    
    angular <= editor <= hub.client <= hub.server <= corpus
    
    
    
    //on the client
    var editor = require('puddle-editor');
    var hub = require('puddle-hub').client;
    editor.connect(hub);
    
    //on web client, in a browser
    var editor = require(‘puddle-editor’)({
        ui:require(‘puddle-html5’ || ‘puddle-D3’)
        conn: require(‘puddle-hub’).connect(),
    });
    
    // on server
    var hub = require(‘puddle-hub’).server;
    hub.connect(require(‘puddle-corpus’).open(file));
    hub.serve(PORT);
    
    // on local client
    var editor = require(‘puddle-editor’)({
        ui:require(‘puddle-cli’)
        conn: require(‘puddle-hub’).connect(), // optional
        conn: require(‘puddle-corpus’).open(filename), // optional
    });
    




## Demo of how to use local modules:

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
    
## Travis
With current setup of submodules travis usese an ENV variable MODULES and it has to be defined before npm test
    MODULE='puddle-corpus' npm test // that means run npm test from './puddle-corpus' only
Make sure to declare env variables for each of sub modules 