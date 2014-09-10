## Puddle-hub

Socket.io adapter for puddle-crud to sync data server<=>browser


###Features:    
    [ ] Server <=> Client sync               
    [ ] Consists of Server and Client parts  
    [ ] Conforms to Corpus CRUD API    
    [ ] Does not use puddle syntax
    [ ] Synchronizes puddle-crud instances
    Todo:
    [ ] Optimistic and pessimistic events (fires instantly and upon server confirmation) 
    
    
###Installation:
    
    npm install puddle-hub
    npm test        # optional
    
###Usage:    
    //on the Server
    var app = require('express')();
    var server = require('http').Server(app);    
    var hubServer = require(‘puddle-hub’).server(server);
    server.listen(80);
    
    //on the Client
    var hubClient = require(‘puddle-hub’).client();
    
    //returns current state as an array
    hubClient.on('connect', function(array) {})
    
    hub.create(id,obj)  //returns promise 
    hub.remove(id)      //returns promise
    hub.update(id,obj)  //returns promise
        
    hub.on('create', function(id, obj) {} );
    hub.on('remove', function(id) {} );
    hub.on('update', function(id, obj) {} );
    
    //Promise returned by HUB will be fulfilled when Server have confirmed receipt of message
    //AND
    //Each .create, .remove, .update method will emit corresponding event upon confirmation from the server.                                      

## Contributors

- Fritz Obermeyer <https://github.com/fritzo>
- Yan T. <https://github.com/yangit>

Puddle was factored out of [Pomagma](https://github.com/fritzo/pomagma) in 2014.

## License

Copyright 2013-2014 Fritz Obermeyer.<br/>
Puddle is licensed under the [MIT license](/LICENSE).