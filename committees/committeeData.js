var Committee = require('./committeeModel.js');

// THIS STRUCTURE IS SAVED TO MONGO
// THIS STRUCTURE IS ALSO UPDATED IF (and only if) THE DOC EXISTS.
// OTHERWISE, THIS IS USED AS THE DEFAULT "STARTING" POINT

var initialModel = {
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
  "Arab League": {
    voteSessions: {

    },
    resolutions: {

    }
  },
  "ECOSOC": {
    voteSessions: {

    },
    resolutions: {

    }
  },
}

var vote = function(user, type, sessionObj) {
  sessionObj.votes[user.country] = {school: user.school, type: type};
}

var getVote = function(user, sessionObj) {
  return sessionObj.votes[user.country];
}

var saveToDB = function(committeeData){
  // Saving on "every" event is "probably" not a good idea.
  for (var key in committeeData) {
    var query = {name: key};
    Committee.findOneAndUpdate(query, committeeData[key], {upsert:true}, function(err, doc){
      if (err) console.log("COULD NOT SAVE");
    });
  }
}

var loadData = function(committeeData) {
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

module.exports = {
  initialModel: initialModel,
  vote: vote,
  getVote: getVote,
  saveToDB: saveToDB,
  initialLoad: loadData
}

