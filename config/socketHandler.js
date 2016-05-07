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
    votes[user.country] = {school: user.school, type: type};
  }

  currentObj.getVote = function(user) {
    return votes[user.country];
  }

  return currentObj;
}

console.log(JSON.stringify(VoteSession()));

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
        console.log(user);
        console.log("HAS SUBSCRIBED");
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
        committeeData[user.committee].voteSessions[data.title].vote(user, data.voteType);
        socket.to(user.committee).emit("vote update", committeeData[user.committee].voteSessions)
      }


    });

    socket.on("vote get", function(data){
      var user = jwt.decode(data.token, process.env.TOKEN_SECRET);

      if (user) {
        console.log("EMITTING");
        socket.emit("vote update", committeeData[user.committee].voteSessions);
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

