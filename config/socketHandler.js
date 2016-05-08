var jwt  = require('jwt-simple');

// 3 recognized vote types:
// PASS, REJECT, ABSTAIN

var VoteSession = function(creator) {
  var currentObj = {};

  currentObj.closed = false;
  currentObj.creator = creator;
  currentObj.votes = {};

  // Add more data to each vote
  currentObj.vote = function(user, type) {
    currentObj.votes[user.country] = {school: user.school, type: type};
    console.log("ADDING VOTE");
    console.log(JSON.stringify(currentObj.votes, null, 2));
  }

  currentObj.getVote = function(user) {
    return votes[user.country];
  }

  return currentObj;
}

// TODO: Build using Mongo committee Database
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

module.exports = function (io) {
  io.on("connection", function(socket){

    socket.on("subscribe", function(data){
      var user = jwt.decode(data.token, process.env.TOKEN_SECRET);

      if (user) {
        console.log("SUBSCRIBED: " + user.email);
        console.log("to " + user.committee + " " + user.country + " and " + user.committee)
        socket.join(user.committee + " " + user.country);
        socket.join(user.committee);
      }

    });

    socket.on("resolution add", function(){

    });

    socket.on("resolution sign", function(){

    });

    socket.on("vote add", function(data){
      var user = jwt.decode(data.token, process.env.TOKEN_SECRET);

      if (user) {
        console.log(data.type)
        committeeData[user.committee].voteSessions[data.title].vote(user, data.type);
        io.sockets.in(user.committee).emit("vote update", committeeData[user.committee].voteSessions)
      }


    });

    socket.on("vote get", function(data){
      var user = jwt.decode(data.token, process.env.TOKEN_SECRET);

      if (user) {
        console.log(user.committee + " emitting");
        io.sockets.in(user.committee).emit("vote update", committeeData[user.committee].voteSessions);
      }

    });

    socket.on("logout", function(data){
      var user = jwt.decode(data.token, process.env.TOKEN_SECRET);

      if (user) {
        socket.leave(user.committee + " " + user.country);
        socket.leave(user.country);
      }

    });

  });
}

