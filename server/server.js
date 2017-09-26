var express       = require('express');
var http          = require('http');
var path          = require('path');
var serveStatic   = require('serve-static');
var cors          = require('cors');

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.set('port', 3000);
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

// ---------------------------------------------
// T W I T C H  I N F O
// Kli-ant eye-dee:    p55q6hl4q7kb42ssc4on7h67uppjji
// Kli-ant see-krate:  56cnu8wx5kzi8a3pc1blm0sp6sxtm0
// oauth-pass :        oauth:9mjo7jlerp6jxr5z3ue3qdqv9ucsfb
// ----------------------------------------------
var tmi = require("tmi.js");
var options = {
    options: { debug: true},
    connection: { reconnect: true },
    identity: {
        username: "hotmaxinteractive",
        password: "oauth:9mjo7jlerp6jxr5z3ue3qdqv9ucsfb"
    },
    channels: ["#hotmaxinteractive"]
};
var client = new tmi.client(options);
client.connect();
client.on("connected", function (address, port) {

  //collect messages from twitch
  client.on("chat", function (channel, userstate, message, self) {
    //if (self) return; //if you dont want to listen to your own messages
    io.emit('chat', message, userstate.username);
  });

});



// -- start socket outward
var userId = 0;
io.on('connection', function (socket) {

  //make sure that any clients that speak to chat-socket know about each other
  socket.on('chat', function(data) {
    console.log('socket.on -chat- data: '  + data);
    io.emit('chat', {
      values: {message: data, username: 'i dont know'}
    });
  })

  //make sure that any clients that speak to chat-socket know about each other
  socket.on('unitysayhi', function(data) {
    console.log(data);
  })

  //any client that speaks to twitch-socket sends an update to twitch chat channel
  socket.on('twitch', function(data) {
    client.say("#hotmaxinteractive", data)
      .then(function(data) { console.log(data); })
      .catch(function(err) { console.log(err); });
  })

});


http.listen(app.get('port'), () => {
  console.log("doth server has started, on: " + app.get('port'));
});
