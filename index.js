var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.set('port', process.env.PORT || 3000);
app.set('keyFile', process.env.PUT_IO_KEY_FILE || 'DEV');

app.get('/keys', function(req, res) {
  res.sendFile(__dirname + '/put_io_keys/' + app.get('keyFile'));
});

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
  app.use(express.static('resources'));
});

io.on('connection', function(socket) {
  socket.on('chat message', function(msg) {
    io.emit('chat message', msg);
  });
});

http.listen(app.get('port'), function() {
  console.log('listening on *:3000');
});
