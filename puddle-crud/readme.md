## Puddle-crud

Corpus CRUD API wrapper


###Features:
    [X] Minimum dependencies
    [*] Can be connectd in a branched fashion, can't in circular  
    Returns a `Crud` class which is:    
        [X] an instance of EventEmitter
        [X] emits: `create`,`remove`,`update` events
        [X] implements create,remove, update methods
        [X] implements getState method which returns internal state
        [X] implements connect method which allows to 
                bi-directionally bind it to another instance of same class.
        [X] Object agnostic (does not care what to sync)
        
        
         
    
    
###Installation:
    
    npm install puddle-crud
    npm test        # optional
    
###Usage:

####Basic usage:    
    
    var Crud = require(‘puddle-crud’)
    var initialArray = [Obj1, Obj2, ...];
    var crud = new Crud(initialArray);  //optionaly pass in init array
    crud.on('create', function (obj) {
        console.log('Create event called with ',obj);
    })
    crud.create(Obj3); //here an event will fire and you'll see in Console
    // Create event called with Obj3
    
    crud.getState() // returns current state of the internal array currently : [Obj1, Obj2, Obj3 ...];

####Chaining:
    var Crud = require(‘puddle-crud’)
    var initialArray = [Obj1, Obj2, ...];
    var one = new Crud(initialArray);
    var two = new Crud();
    var three = new Crud();
    
    two.connect(one);
    
    three.getState() // []
    three.connect(two);        
    three.getState() // [Obj1, Obj2, ...]; because .connect() pulls in other instance's state.
    
    one.on('create', function (obj) {
        console.log('One got an object ',obj);
    })
    three.on('create', function (obj) {
        console.log('Three got an object ',obj);
    })
    
    //events propogate through the chain
    one.create(obj) // 'Three got an object obj'
    
    //both ways
    three.create(obj) // 'One got an object obj'         
            

## Contributors

- Fritz Obermeyer <https://github.com/fritzo>
- Yan T. <https://github.com/yangit>

Puddle was factored out of [Pomagma](https://github.com/fritzo/pomagma) in 2014.

## License

Copyright 2013-2014 Fritz Obermeyer.<br/>
Puddle is licensed under the [MIT license](/LICENSE).