var jwt  = require('jwt-simple');
var Committee = require('../committees/committeeModel.js');
var User = require('../users/userModel.js');

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
      if (initial) console.log("COMPLETED INITIAL LOAD");
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

var Resolution = function(publicLink, creator) {
  var currentObj = {};

  currentObj.original = creator;

  currentObj.publicLink = publicLink;

  currentObj.mainsub = {};
  currentObj.cosub = {};
  currentObj.signat = {};
  currentObj.requests = {};

  currentObj.mainsub[creator] = true;
  currentObj.approved = false;

  // main sub, co sub, signators
  // Min signators.

  return currentObj;
}

// THIS STRUCTURE IS SAVED TO MONGO
// THIS STRUCTURE IS ALSO UPDATED IF (and only if) THE DOC EXISTS.
// OTHERWISE, THIS IS USED AS THE DEFAULT "STARTING" POINT
// WE CAN USE REDIS LATER TO STORE THIS (SCALING) :P
var committeeData = {
  "General Assembly": {
    voteSessions: {

    },
    resolutions: {

    }
  },
  "Security Council": {
    voteSessions: {

    },
    resolutions: {

    }
  },
}


// Loads data from DB into committeeData, if exists.
// Otherwise, it uses the default. 
var loadData = function() {
  var loaded = 0;
  var keys = Object.keys(committeeData).length;
  for (var key in committeeData) {
    var query = {name: key};
    Committee.findOne(query, function(err, comRes){
      if (comRes) {
        committeeData[comRes.name] = comRes;
      }


      if (!err) {
        loaded++;
        if (keys === loaded) {
          console.log("LOAD FROM DB COMPLETE.")
          console.log();
        }
      }

    });
  }
}

module.exports = function (io) {
  io.on("connection", function(socket){


    /////////////////////////////////////////////////////////////
    /// General Activity listeners                            ///
    /////////////////////////////////////////////////////////////

    socket.on("subscribe", function(data){
      var user = jwt.decode(data.token, process.env.TOKEN_SECRET);

      if (user) {
        socket.join(user.committee + " " + user.country);
        socket.join(user.committee);
        console.log(user.firstName + " is joining " + user.committee);

      }

    });

    socket.on("logout", function(data){
      var user = jwt.decode(data.token, process.env.TOKEN_SECRET);

      if (user) {

        socket.leave(user.committee + " " + user.country);
        socket.leave(user.country);

        console.log(user.firstName + " is leaving " + user.committee);

      }

    });

    /////////////////////////////////////////////////////////////
    /// Resolution Socket listeners                           ///
    /////////////////////////////////////////////////////////////

    socket.on("resolution create", function(data) {

      var user = jwt.decode(data.token, process.env.TOKEN_SECRET);

      if (user) {
        committeeData[user.committee].resolutions[data.name] = Resolution(data.link, user.country);

        io.sockets.in(user.committee).emit("resolution update", committeeData[user.committee].resolutions);

        saveToDB(committeeData);
      }
    });

    socket.on("resolution sign request", function(data) {
      var user = jwt.decode(data.token, process.env.TOKEN_SECRET);

      if (user) {
        committeeData[user.committee].resolutions[data.name].requests[user.country] = {
          type: data.signType
        };

        io.sockets.in(user.committee).emit("resolution update", committeeData[user.committee].resolutions);

        saveToDB(committeeData);
      }

    });


    socket.on("resolution sign revoke", function(data) {
      var user = jwt.decode(data.token, process.env.TOKEN_SECRET);

      if (user) {
        committeeData[user.committee].resolutions[data.name].requests[user.country] = undefined;

        committeeData[user.committee].resolutions[data.name].cosub[user.country] = undefined;
        committeeData[user.committee].resolutions[data.name].signat[user.country] = undefined;

        io.sockets.in(user.committee).emit("resolution update", committeeData[user.committee].resolutions);
        saveToDB(committeeData);
      }

    });

    socket.on("resolution sign accept", function(data) {

      var user = jwt.decode(data.token, process.env.TOKEN_SECRET);

      var resPick = committeeData[user.committee].resolutions[data.name];

      if (user && (resPick.creator === user.country)) {

        var type = resPick.requests[data.country];
        resPick[type] = true;

        io.sockets.in(user.committee).emit("resolution update", committeeData[user.committee].resolutions);
        saveToDB(committeeData);

      }

    });

    socket.on("resolution approve", function(data) {
      var user = jwt.decode(data.token, process.env.TOKEN_SECRET);

      if (user && user.userLevel === "Chair") {

        committeeData[user.committee].resolutions[data.name].approve = true;
        io.sockets.in(user.committee).emit("resolution update", committeeData[user.committee].resolutions);
        console.log(user.firstName + " is getting resolutions " + " for " + user.committee);
        saveToDB(committeeData);
      }

    });

    socket.on("resolution get", function(data) {

      var user = jwt.decode(data.token, process.env.TOKEN_SECRET);

      if (user) {

        socket.emit("resolution update", committeeData[user.committee].resolutions);
        console.log(user.firstName + " is getting resolutions " + " for " + user.committee);

      }

    });

    /////////////////////////////////////////////////////////////
    /// Vote Socket listeners                                 ///
    /////////////////////////////////////////////////////////////

    socket.on("vote add", function(data){
      var user = jwt.decode(data.token, process.env.TOKEN_SECRET);

      if (user) {
        vote(user, data.type, committeeData[user.committee].voteSessions[data.title]);
        io.sockets.in(user.committee).emit("vote update", committeeData[user.committee].voteSessions);
        console.log(user.firstName + " is changing votes");
        saveToDB(committeeData);
      }

    });

    socket.on("vote get", function(data){
      var user = jwt.decode(data.token, process.env.TOKEN_SECRET);

      if (user) {

        socket.emit("vote update", committeeData[user.committee].voteSessions);
        console.log(user.firstName + " is getting votes " + " for " + user.committee);

      }

    });

    socket.on("vote create", function(data){
      var user = jwt.decode(data.token, process.env.TOKEN_SECRET);
      if (user && user.userLevel === "Chair") {
        committeeData[user.committee].voteSessions[data.voteName] = VoteSession(data.creator);
        io.sockets.in(user.committee).emit("vote update", committeeData[user.committee].voteSessions);
        saveToDB(committeeData);

      }
    });

    socket.on("vote close", function(data){
      var user = jwt.decode(data.token, process.env.TOKEN_SECRET);
      if (user && user.userLevel === "Chair") {
        committeeData[user.committee].voteSessions[data.voteName].closed = true;
        io.sockets.in(user.committee).emit("vote update", committeeData[user.committee].voteSessions);
        saveToDB(committeeData);
      }
    });


  });
}

// Inital committee data load.
loadData();

