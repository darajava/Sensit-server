let WebSocketServer = require('ws').Server;

let webSocketServer = require('websocket').server;
let http = require('http');
let jwt = require('jsonwebtoken');

let clients = [ ];

let server = http.createServer(function(request, response) {});

server.listen(1338, function() {});

/**
 * WebSocket server
 */
let wss = new webSocketServer({
  // http://tools.ietf.org/html/rfc6455#page-6
  httpServer: server
});

/**
The way I like to work with 'ws' is to convert everything to an event if possible.
**/
function toEvent (message) {
  try {
    let event = JSON.parse(message);
    this.emit(event.type, event.payload);
  } catch(err) {
    console.log('not an event' , err);
  }
}

wss.on('request', (request) => {

  let connection = request.accept(null, request.origin); 
  let index = clients.push(connection) - 1;
  console.log('am I gere?');

  connection.on('message', (message) => {

    let parsedMessage = JSON.parse(message.utf8Data);
    
    for (let i = 0; i < clients.length; i++) {
      let obj = {
        time: (new Date()).getTime(),
        text: parsedMessage.text,
      };

      // broadcast message to all connected clients
      let json = JSON.stringify({ type:'message', data: obj });

      try {
        // XXX: get new key
        var decoded = jwt.verify(parsedMessage.token, 'tokenSecret');
        clients[i].send(json);
      } catch(err) {
        console.log('Error in sector 7G');
      }

    }
  });

});
