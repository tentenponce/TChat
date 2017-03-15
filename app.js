/* include libraries */
var express = require('express');
var session = require('express-session');
var http = require('http');
var bodyParser = require('body-parser');
var path = require('path');
var handlebars  = require('express-handlebars'), hbs;
var WebSocketServer = require('websocket').server;

var app = express();

/* Setup Express MVC */
app.set('port', 1337);
app.set('views', path.join(__dirname, 'views')); //set where to get views, /views folder

hbs = handlebars.create({
   defaultLayout: 'Main' //set the parent layout of views
});

app.engine('handlebars', hbs.engine); //all views with .handlebars (dont know actually what's exactly this)
app.set('view engine', 'handlebars'); //set the view engine, handlebars (dont know actually what's exactly this)

app.use(bodyParser.urlencoded({ extended: false })); //to read key value pairs on post methods
app.use(session({
  secret: 'tenten',
  user_id: ""
})); //initialize the session for user authentication

app.use(function(req, res, next) {
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
}); //no caching

app.use(express.static('public')); //set the static directory (css frameworks, js)
require('./router')(app); //setup the router

var server = http.createServer(app);

server.listen(app.get('port'), function(){
  console.log('Running at port ' + app.get('port'));
});

/* Setup websocket server */
wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

// list of currently connected clients (users)
var clients = [];
wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      return;
    }


    console.log((new Date()) + ' Connection from origin ' + request.origin + '.');

    var connection = request.accept('echo-protocol', request.origin);
    clients.push(connection);

    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            for (var i = 0; i < clients.length; i++) {
              clients[i].sendUTF(message.utf8Data); //send to all clients
            }
        }
    });

    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + " Peer " + connection.remoteAddress + " disconnected.");

        //loop to the clients and compare remote address
        for (var i = 0; i < clients.length; i ++) {
          if (connection.remoteAddress == clients[i].remoteAddress) { //if same remote address
            clients.splice(i, 1); //remove it from the list
          }
        }
    });
});
