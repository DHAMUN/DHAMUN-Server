var jwt  = require('jwt-simple');

var committeeData = require('../committees/committeeData.js').initialModel;

var saveToDB = require('../committees/committeeData.js').saveToDB;
var VoteSession = require('../voteSessions/voteSession.js');

var vote = require('../committees/committeeData.js').vote;
var getVote = require('../committees/committeeData.js').getVote;

module.exports = {

  add: function(data){
    var user = jwt.decode(data.token, process.env.TOKEN_SECRET);

    if (user) {
      vote(user, data.type, committeeData[user.committee].voteSessions[data.title]);
      this.sockets.in(user.committee).emit("vote update", committeeData[user.committee].voteSessions);
      console.log(user.firstName + " is changing votes");
      saveToDB(committeeData);
    }

  },

  get: function(data){
    var user = jwt.decode(data.token, process.env.TOKEN_SECRET);
    if (user) {
      this.emit("vote update", committeeData[user.committee].voteSessions);
      console.log(user.firstName + " is getting votes " + " for " + user.committee);
    }

  },

  create: function(data){
    var user = jwt.decode(data.token, process.env.TOKEN_SECRET);
    if (user && user.userLevel !== "Delegate") {
      committeeData[user.committee].voteSessions[data.voteName] = VoteSession(data.creator);
      this.sockets.in(user.committee).emit("vote update", committeeData[user.committee].voteSessions);
      saveToDB(committeeData);
    }
  },

  close: function(data){
    var user = jwt.decode(data.token, process.env.TOKEN_SECRET);
    if (user && user.userLevel !== "Delegate") {
      committeeData[user.committee].voteSessions[data.voteName].closed = true;
      this.sockets.in(user.committee).emit("vote update", committeeData[user.committee].voteSessions);
      saveToDB(committeeData);
    }
  }

}

