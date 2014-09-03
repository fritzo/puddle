## Puddle-corpus

Corpus representaion stored in JSON and wrapped into Corpus CRUD API


###Features:
    [X] Zero dependencies
    [*] .json <-> .corpus file conversion utility
        [X] Pretty prints .json output to make it easier to track with git
        [X] Uses STDIO and STDOUT as input and output
        [X] Automatically determines type of input data (json or corpus)
    [ ] Conforms to Corpus CRUD API
    [ ] Stores data as JSON    
    [ ] Validate variable appearance constraints
    [ ] Normalize corpus (i.e. cat corpus.dump | sort | uniq)
    
    
###Installation:
    
    npm install puddle-corpus
    npm test        # optional
    
###Usage:    
    
    var corpus = require(‘puddle-corpus’)(JSONfile)
        
In corpus variable you will have Corpus CRUD API object which will use given 
file as a DB

###JSON file format:
    
    [{id: id ,code: code, checkedOut:userName},...]

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