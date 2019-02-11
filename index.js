
var express = require("express");
var app = express();

var http = require("http");
var server = http.Server(app);

var socketio = require("socket.io");
var io = socketio(server);

var clients = {};
var players = {};

app.use(express.static("pub"));

io.on('connection', function(socket){
  clients[socket.id] = socket;
  io.emit('add current players', players);
  socket.emit('receive player id', socket.id);

  socket.on('disconnect', function(){
	var playerTuple = [];
	playerTuple.push(socket.id);
	playerTuple.push(players[socket.id]);
	socket.broadcast.emit('client disconnecting', playerTuple);
	delete clients[socket.id];
	delete players[socket.id];
  });

  socket.on('message', function(msg){
    io.emit('message', msg);
  });

  socket.on('player joined', function(newPlayer){
	var newPlayerTuple = [];
	players[socket.id] = newPlayer;
	newPlayerTuple.push(socket.id);
	newPlayerTuple.push(newPlayer);
	socket.broadcast.emit('player joined', newPlayerTuple);
  });

  socket.on('newuser', function(username){
     io.emit('message', username + ' has joined the game.');
  });

  socket.on('position change', function(position){
        players[socket.id] = position;
	playerTuple = [];
	playerTuple.push(socket.id);
	playerTuple.push(position);

	socket.broadcast.emit('position change', playerTuple);
  });


});



server.listen(3004, function(){
  console.log('listening on *:3004');
});
