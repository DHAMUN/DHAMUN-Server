var jwt  = require('jwt-simple');
var Committee = require('../committees/committeeModel.js');
// 3 recognized vote types:
// PASS, REJECT, ABSTAIN
var vote = function(user, type, sessionObj) {
  sessionObj.votes[user.country] = {school: user.school, type: type};

}

var getVote = function(user, sessionObj) {
  return sessionObj.votes[user.country];
}

var saveToDB = function(committeeData, initial){
  for (var key in committeeData) {
    var query = {name: key};
    Committee.findOneAndUpdate(query, committeeData[key], {upsert:true}, function(err, doc){
      if (err) console.log("COULD NOT SAVE");
    });
  }
}


var VoteSession = function(creator) {
  var currentObj = {};

  currentObj.closed = false;
  currentObj.creator = creator;
  currentObj.votes = {};

  return currentObj;
}

// THIS STRUCTURE IS SAVED TO MONGO
// THIS STRUCTURE IS ALSO UPDATED IF (and only if) THE DOC EXISTS.
// OTHERWISE, THIS IS USED AS THE DEFAULT "STARTING" POINT
// WE CAN USE REDIS LATER TO STORE THIS (SCALING) :P
var committeeData = {
  "General Assembly": {
    voteSessions: {
      'Pass Resolution X': VoteSession("Germany")
    },
    resolutions: []
  },
  "Security Council": {
    voteSessions: {},
    resolutions: []
  },
}


// Loads data from DB into committeeData, if exists.
// Otherwise, it uses the default. 
var loadData = function() {
  for (var key in committeeData) {
    var query = {name: key};
    Committee.findOne(query, function(err, res){
      if (res) {
        committeeData[res.name] = res;
      }
    });
  }
}

module.exports = function (io) {
  io.on("connection", function(socket){

    socket.on("subscribe", function(data){
      var user = jwt.decode(data.token, process.env.TOKEN_SECRET);

      if (user) {
        socket.join(user.committee + " " + user.country);
        socket.join(user.committee);
      }

    });

    socket.on("resolution create", function(){

    });

    socket.on("resolution sign", function(){

    });

    socket.on("vote add", function(data){
      var user = jwt.decode(data.token, process.env.TOKEN_SECRET);

      if (user) {
        vote(user, data.type, committeeData[user.committee].voteSessions[data.title]);
        io.sockets.in(user.committee).emit("vote update", committeeData[user.committee].voteSessions)
        saveToDB(committeeData);
      }


    });

    socket.on("vote get", function(data){
      var user = jwt.decode(data.token, process.env.TOKEN_SECRET);

      if (user) {
        io.sockets.in(user.committee).emit("vote update", committeeData[user.committee].voteSessions);
      }

    });

    socket.on("vote create", function(data){
      var user = jwt.decode(data.token, process.env.TOKEN_SECRET);
      if (user.userLevel === "Chair") {
        committeeData[user.committee].voteSessions[data.voteName] = VoteSession(data.creator);
      }
    })

    socket.on("logout", function(data){
      var user = jwt.decode(data.token, process.env.TOKEN_SECRET);

      if (user) {
        socket.leave(user.committee + " " + user.country);
        socket.leave(user.country);
      }

    });

  });
}

// Inital committee data load.
loadData();

