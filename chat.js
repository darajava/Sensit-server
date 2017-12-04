let WebSocketServer = require('ws').Server;

let webSocketServer = require('websocket').server;
let http = require('http');
let jwt = require('jsonwebtoken');
let mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/sensit');

let Room = require('./models/room');

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
  
  let roomId = request.resourceURL.query.room;
  let users = JSON.parse(request.resourceURL.query.users);
  let room;

  clients[index].userId = request.resourceURL.query.myId;

  users.push(request.resourceURL.query.myId);

  console.log(clients[index]);

  if (roomId && typeof roomId !== 'undefined') {
    // Always make a new room, it won't overwrite if it exists
    room = new Room({
      _id: roomId,
      users: users,
    });
    room.save();
  }

  connection.on('message', (message) => {

    let parsedMessage = JSON.parse(message.utf8Data);
    
    for (let i = 0; i < clients.length; i++) {
      let obj = {
        time: (new Date()).getTime(),
        text: parsedMessage.text,
        userId: clients[index].userId,
      };

      // broadcast message to all connected clients
      let json = JSON.stringify({ type:'message', data: obj });

      try {
        // XXX: get new key
        console.log(room.users.includes(clients[i].myId));
        console.log(room.users);
        console.log(clients[i].userId);
        var decoded = jwt.verify(parsedMessage.token, 'tokenSecret');

        if (room.users.includes(clients[i].userId)) {
          clients[i].send(json);
        }

        // console.log(clients[i]);
      } catch(err) {
        console.log(err);
        console.log('Error in sector 7G');
      }

    }
  });

});
