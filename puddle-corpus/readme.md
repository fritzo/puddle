## Puddle-corpus

Corpus representaion stored in JSON and wrapped into Corpus CRUD API


###Features:
    [X] Minimum dependencies
    [X] .json <-> .corpus file conversion utility
        [X] Pretty prints .json output to make it easier to track with git
        [X] Uses STDIO and STDOUT as input and output
        [X] Automatically determines type of input data (json or corpus)
        [X] Corpus file may have comments starting with #
        [X] Normalize corpus (i.e. cat corpus.dump | sort | uniq)            
    [X] Stores data as JSON
    [*] Conforms to Corpus CRUD API    
    To be implemented:    
    [ ] Validate variable appearance constraints    
        [ ] Duplicate lines are removed.
        [ ] No variable is DEFINE'd multiple times,
        [ ] Every free variable is DEFINE'd once.
    
    
###Installation:
    
    npm install puddle-corpus
    npm test        # optional
    
###Usage:    
    
    var corpus = require(‘puddle-corpus’)(JSONfile)
        
In corpus variable you will have Corpus CRUD API object which will use given 
file as a DB. Referr to puddle-crud module for API documentation.

###JSON file format:
    
    [{id: code, id2: code2, id3: code3 ...}]

###.json<=>.corpus conversion utility
    //Takes file on STDIO and outputs to STDOUT
    //Input format is determined automatically by calling JSON.parse()
    node convert < corpus/main.json > corpus/main.corpus 
    node convert < corpus/main.corpus > corpus/main.json
    
###Corpus file format
    
The corpus file format is as follows:

* One line per statement,
* Statements are either ASSERT or DEFINE
* No trailing newline,
* Lines are sorted lexicographically,

In addition, each file should satisfy the constraints:

* Duplicate lines are removed.
* No variable is DEFINE'd multiple times,
* Every free variable is DEFINE'd once.

## Contributors

- Fritz Obermeyer <https://github.com/fritzo>
- Yan T. <https://github.com/yangit>

Puddle was factored out of [Pomagma](https://github.com/fritzo/pomagma) in 2014.

## License

Copyright 2013-2014 Fritz Obermeyer.<br/>
Puddle is licensed under the [MIT license](/LICENSE).