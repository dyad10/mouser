(function() {
  var clients, fs, http, io, server, socket, sys;

  http = require('http');

  fs = require('fs');

  sys = require('util');

  io = require('socket.io');

  clients = [];

  clients_xy = [];

  clients_colors = [];

  server = http.createServer(function(request, response) {
    var rs;
    response.writeHead(200, {
      'Content-Type': 'text/html'
    });
    rs = fs.createReadStream(__dirname + '/template.html');
    return sys.pump(rs, response);
  });


  socket = io.listen(server);

  socket.configure(function () { 
    io.set("transports", ["xhr-polling"]); 
    io.set("polling duration", 10); 
  });

  socket.sockets.on('connection', function(client) {
    var username;
    username = null;
    client.send('Welcome to this socket.io mouse tracker!');
    client.send('Please provide your user name');
    return client.on('message', function(message) {
      var feedback = [];
      if (!username) {
        username = message;
        client.send("welcome, " + username + "!");
	clients.push(username);
	clients_xy.push({"x" : -1, "y" : -1 });
	clients_colors.push('#'+Math.floor(Math.random()*16777215).toString(16));
	client.broadcast.send('roll: ' + clients.join(","));
	client.send('roll: ' + clients.join(","));
        return;
      }
      // send the positions and colors
      for(var i=0; i< clients.length; i++) {
	// update the x,y coordinate
        if(clients[i] == username) {
	  var Regex = /(\d+),(\d+)/;
	  var arr = Regex.exec(message)

	  clients_xy[i] = {"x" : arr[1], "y" : arr[2]};
	  console.log(clients_xy);
	}

	// prepare the message to send back
	feedback.push('{"client" : "' + username + '", "color" : "' + clients_colors[i] + '", "position" : ' + JSON.stringify(clients_xy[i]) + '}');
        feedback_string = "update: [" + feedback.join(",") + "]";
      }

      client.send(feedback_string);
      return client.broadcast.send(feedback_string);
    });
  });


  var port = process.env.PORT || 8888;

  server.listen(port);

}).call(this);
