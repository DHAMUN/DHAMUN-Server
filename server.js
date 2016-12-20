// Load .env file only if not in production
if (process.env.NODE_ENV != "production") {
  require('dotenv').config();
}

var express     = require('express'),
    mongoose    = require('mongoose');

var app = express(),
    cors = require('cors');
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(cors());
mongoose.connect(process.env.MONGODB_URI); // connect to mongo database

// Serve static files
// Because this isn't a big deal, we can just let
// express do this for us. No need for Nginx
app.use(express.static(__dirname + '/static'));

// configure our server with all the middleware and and routing
require('./config/middleware.js')(app, express);
require('./config/socketHandler.js')(io);

// export our app for testing and flexibility, required by index.js

server.listen(process.env.PORT || 8000);

module.exports = app;


/* Walkthrough of the server

  Express, mongoose, and our server are initialzed here
  Next, we then inject our server and express into our config/middleware.js file for setup.
    We also exported our server for easy testing

  middleware.js requires all express middleware and sets it up
  our authentication is set up there as well
  we also create individual routers
  each feature has its own folder with a model, controller, and route file
    the respective file is required in middleware.js and injected with its mini router
    that route file then requires the respective controller and sets up all the routes
    that controller then requires the respective model and sets up all our endpoints which respond to requests

*/
